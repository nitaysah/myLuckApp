import crypto from 'crypto';

const ALGORITHM_VERSION = '1.0';
const MODEL_VERSION = 'prototype-0.1';

function reduceToSingleDigit(number) {
  let n = Math.abs(Number(number));
  while (n > 9) {
    let sum = 0;
    while (n > 0) {
      sum += n % 10;
      n = Math.floor(n / 10);
    }
    n = sum;
  }
  return n;
}

function calculateBaseline(nameStr, dobStr) {
  const [year, month, day] = dobStr.split('-').map(Number);
  const lifePathNumber = reduceToSingleDigit(day) + reduceToSingleDigit(month) + reduceToSingleDigit(year);
  const finalLifePath = reduceToSingleDigit(lifePathNumber);

  const now = new Date();
  const dailyString = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`;

  const nameLower = (nameStr || '').toLowerCase();
  let nameHash = 0;
  for (let i = 0; i < nameLower.length; i++) {
    const charCode = nameLower.charCodeAt(i);
    const val = (charCode > 127) ? 0 : charCode;
    nameHash += val;
  }

  const combinedString = `${finalLifePath}-${nameHash}-${dailyString}`;

  let hash = BigInt(5381);
  for (let i = 0; i < combinedString.length; i++) {
    const charCode = combinedString.charCodeAt(i);
    const val = BigInt((charCode > 127) ? 0 : charCode);
    const shifted = BigInt.asIntN(64, hash << 5n);
    const sumOriginal = BigInt.asIntN(64, shifted + hash);
    hash = BigInt.asIntN(64, sumOriginal + val);
  }

  const absHash = (hash < 0n) ? -hash : hash;
  const percentage = Number(absHash % 101n);

  return percentage;
}

function simpleCalibrator(baseline, dobStr) {
  const parts = (dobStr || '').split('-');
  const day = Number(parts[2] || 1);
  const adjust = (day % 5) - 2; // -2..+2
  let calibrated = baseline + adjust;
  calibrated = Math.max(0, Math.min(100, Math.round(calibrated)));

  const confidence = Math.max(30, Math.min(95, 70 + Math.round((baseline - 50) * 0.4)));
  return { calibrated, confidence };
}

function signSnapshot(snapshotObj) {
  const secret = process.env.SIGNING_SECRET || 'dev-signing-secret';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(snapshotObj));
  return hmac.digest('hex');
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, dob } = req.body || {};
    if (!name || !dob) return res.status(400).json({ error: 'name and dob required (YYYY-MM-DD)' });

    const baseline = calculateBaseline(name, dob);
    const { calibrated, confidence } = simpleCalibrator(baseline, dob);

    const min = Math.max(0, Math.min(baseline, calibrated) - 3);
    const max = Math.min(100, Math.max(baseline, calibrated) + 3);

    const factors = [
      { name: 'lifePath', contributionPercent: 40, detail: 'Digit reduction of DOB' },
      { name: 'dailySeed', contributionPercent: 35, detail: 'Daily seed string' },
      { name: 'nameHash', contributionPercent: 25, detail: 'ASCII name hash' }
    ];

    const timestamp = new Date().toISOString();
    const seed = `${timestamp}-${baseline}-${calibrated}`;

    const snapshot = {
      name: String(name).substring(0, 64),
      dob,
      baseline,
      calibrated,
      confidence,
      seed,
      modelVersion: MODEL_VERSION,
      algorithmVersion: ALGORITHM_VERSION,
      timestamp
    };

    const signedSnapshot = signSnapshot(snapshot);

    return res.status(200).json({
      percentage: calibrated,
      baseline,
      calibrated,
      confidence,
      range: { min, max },
      explanation: `Baseline ${baseline} → calibrated ${calibrated}. Simple prototype calibrator used.`,
      factors,
      seed,
      modelVersion: MODEL_VERSION,
      algorithmVersion: ALGORITHM_VERSION,
      signedSnapshot
    });
  } catch (err) {
    console.error('assess-luck error', err);
    return res.status(500).json({ error: 'internal' });
  }
}
