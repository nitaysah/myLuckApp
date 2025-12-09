document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const nameInput = document.getElementById('name');
    const dobInput = document.getElementById('dob');
    const revealBtn = document.getElementById('reveal-btn');
    const backBtn = document.getElementById('back-btn');
    const tryAgainBtn = document.getElementById('try-again-btn');
    const resultPercentage = document.getElementById('result-percentage');
    const fortuneText = document.getElementById('fortune-text');
    const traitsList = document.getElementById('traits-list');

    const inputView = document.getElementById('input-view');
    const resultView = document.getElementById('result-view');

    // State
    let name = '';
    let dob = '';

    // Check for "Logged In" user from Get Started Page
    const storedUser = localStorage.getItem('currentUser');
    const logoutBtn = document.getElementById('logout-btn');
    const userGreeting = document.getElementById('user-greeting');

    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            if (user.name) {
                // Auto-fill form
                nameInput.value = user.name;
                name = user.name;

                if (user.dob) {
                    dobInput.value = user.dob;
                    dob = user.dob;
                }

                // Show Logout Button with Name
                if (logoutBtn && userGreeting) {
                    userGreeting.textContent = `Hi, ${user.name.split(' ')[0]}`; // First name only
                    logoutBtn.style.display = 'flex';

                    // Logout Logic
                    logoutBtn.addEventListener('click', () => {
                        if (confirm('Are you sure you want to sign out?')) {
                            localStorage.removeItem('currentUser');
                            window.location.href = 'index.html';
                        }
                    });
                }
            }
        } catch (e) {
            console.error("Error parsing user data", e);
        }
    }

    // Set default date to 25 years ago ONLY if empty
    if (!dobInput.value) {
        const defaultDate = new Date();
        defaultDate.setFullYear(defaultDate.getFullYear() - 25);
        dobInput.valueAsDate = defaultDate;
    }

    // Initial check to enable button/update zodiac
    checkInputs();

    // Add SVG gradient definition for the progress ring
    const svg = document.querySelector('.progress-ring');
    if (svg) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:rgba(255, 230, 128, 1);stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgba(191, 153, 242, 1);stop-opacity:1" />
            </linearGradient>
        `;
        svg.insertBefore(defs, svg.firstChild);
    }

    // ==========================================
    // Logic ported EXACTLY from myLuckLogic.swift
    // ==========================================

    function reduceToSingleDigit(number) {
        let n = Math.abs(number);
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

    function calculateLuckyPercentage(nameStr, dobStr) {
        const [year, month, day] = dobStr.split('-').map(Number);

        // 1. Calculate Life Path Number
        const lifePathNumber = reduceToSingleDigit(day) + reduceToSingleDigit(month) + reduceToSingleDigit(year);
        const finalLifePath = reduceToSingleDigit(lifePathNumber);

        // 2. Daily Seed
        const now = new Date();
        const dailyString = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`;

        // 3. Name Hash (Matching Swift's .asciiValue behavior)
        const nameLower = nameStr.toLowerCase();
        let nameHash = 0;
        for (let i = 0; i < nameLower.length; i++) {
            const charCode = nameLower.charCodeAt(i);
            // Swift's .asciiValue returns nil for non-ASCII, treating as 0
            const val = (charCode > 127) ? 0 : charCode;
            nameHash += val;
        }

        // 4. Combine using djb2 hash (Matching Swift's Int64 overflow behavior)
        const combinedString = `${finalLifePath}-${nameHash}-${dailyString}`;

        // Use BigInt to simulate 64-bit signed integer behavior
        let hash = BigInt(5381);

        for (let i = 0; i < combinedString.length; i++) {
            const charCode = combinedString.charCodeAt(i);
            const val = BigInt((charCode > 127) ? 0 : charCode);

            // hash = ((hash << 5) + hash) + val
            // equivalent to: hash * 33 + val
            // We must simulate strict 64-bit wrapping using asIntN

            const shifted = BigInt.asIntN(64, hash << 5n);
            const sumOriginal = BigInt.asIntN(64, shifted + hash);
            hash = BigInt.asIntN(64, sumOriginal + val);
        }

        // 5. Normalize to 0-100
        // Swift: abs(hash) % 101. 
        // Note: BigInt abs is not built-in, so we check functionality manually.
        const absHash = (hash < 0n) ? -hash : hash;
        const percentage = Number(absHash % 101n);

        return percentage;
    }

    // Zodiac Logic - EXACT match from myLuckLogic.swift
    function getZodiacSign(day, month) {
        switch (month) {
            case 1: return (day >= 20) ? { name: "Aquarius", icon: "♒️" } : { name: "Capricorn", icon: "♑️" };
            case 2: return (day >= 19) ? { name: "Pisces", icon: "♓️" } : { name: "Aquarius", icon: "♒️" };
            case 3: return (day >= 21) ? { name: "Aries", icon: "♈️" } : { name: "Pisces", icon: "♓️" };
            case 4: return (day >= 20) ? { name: "Taurus", icon: "♉️" } : { name: "Aries", icon: "♈️" };
            case 5: return (day >= 21) ? { name: "Gemini", icon: "♊️" } : { name: "Taurus", icon: "♉️" };
            case 6: return (day >= 22) ? { name: "Cancer", icon: "♋️" } : { name: "Gemini", icon: "♊️" };
            case 7: return (day >= 23) ? { name: "Leo", icon: "♌️" } : { name: "Cancer", icon: "♋️" };
            case 8: return (day >= 23) ? { name: "Virgo", icon: "♍️" } : { name: "Leo", icon: "♌️" };
            case 9: return (day >= 23) ? { name: "Libra", icon: "♎️" } : { name: "Virgo", icon: "♍️" };
            case 10: return (day >= 24) ? { name: "Scorpio", icon: "♏️" } : { name: "Libra", icon: "♎️" };
            case 11: return (day >= 23) ? { name: "Sagittarius", icon: "♐️" } : { name: "Scorpio", icon: "♏️" };
            case 12: return (day >= 22) ? { name: "Capricorn", icon: "♑️" } : { name: "Sagittarius", icon: "♐️" };
            default: return { name: "Unknown", icon: "❓" };
        }
    }

    // Fortune explanation generator - EXACT match from myLuckLogic.swift
    function generateLuckExplanation(percentage, nameStr, dobStr) {
        const [year, month, day] = dobStr.split('-').map(Number);
        const zodiac = getZodiacSign(day, month);
        const sign = zodiac.name;

        // All traits from Swift
        const allTraits = [
            "Resilient", "Intuitive", "Charismatic", "Analytical", "Creative",
            "Bold", "Empathetic", "Strategic", "Patient", "Adaptive",
            "Visionary", "Determined", "Compassionate", "Resourceful", "Optimistic",
            "Courageous", "Wise", "Confident", "Ambitious", "Graceful"
        ];

        // Use percentage to select traits - different percentage = different traits
        const trait1 = allTraits[percentage % allTraits.length];
        const trait2 = allTraits[(percentage * 7) % allTraits.length];
        const trait3 = allTraits[(percentage * 13) % allTraits.length];
        const selectedTraits = [...new Set([trait1, trait2, trait3])].slice(0, 3);

        // === EXCEPTIONAL LUCK (85-100) ===
        const exceptionalStatements = [
            "The stars have aligned perfectly for you today! Fortune favors the bold, and you're radiating unstoppable energy.",
            "An extraordinary wave of cosmic luck surrounds you. The universe is conspiring in your favor!",
            "Your celestial chart reveals a rare golden alignment. Today, you are a magnet for good things.",
            "The star of riches is shining brightly upon you. Expect unexpected blessings and thrilling opportunities.",
            "You're on a legendary lucky streak! The cosmos has opened its treasure chest just for you.",
            "I am capable of achieving greatness—and today proves it! Success and prosperity flow toward you.",
            "Everything is going according to plan. You're in the right place at the right time.",
            "Your hard work is about to pay off magnificently. Trust your instincts—they're supercharged today."
        ];

        const exceptionalInsights = [
            "Take bold action; success will follow you.",
            "An unexpected opportunity may change everything.",
            "Love and abundance are flowing your way.",
            "You attract success and prosperity effortlessly.",
            "Every day you are getting closer to reaching your goals.",
            "The universe conspires in your favor to achieve your dreams.",
            "You are energized by your goals and dreams.",
            "Trust that miracles are happening right now."
        ];

        // === GREAT LUCK (70-84) ===
        const greatStatements = [
            `Your ${sign} energy is harmonizing beautifully with today's celestial movements. Great things await!`,
            "The cosmic winds are blowing strongly in your favor. You have the power to create a life you love.",
            "Fortune is smiling upon you today. Your heart is in a place to draw true happiness.",
            "A thrilling time is in your near future. The cards reveal what the heart conceals.",
            "Your aura is glowing with positive vibrations. You're worthy of all the good coming your way.",
            "I am confident in my abilities and decisions—and so should you be today!",
            "You embrace challenges as opportunities to grow. That mindset is paying off.",
            "Positive energy attracts positive outcomes. Keep shining!"
        ];

        const greatInsights = [
            "Now is the time to try something new—you will benefit.",
            "Someone special is thinking of you right now.",
            "A decision you've been pondering will become clear.",
            "Your creativity is at its peak—express yourself!",
            "I am open to new possibilities and opportunities.",
            "I am constantly growing and improving.",
            "I believe in myself and my vision.",
            "Great things are unfolding for me."
        ];

        // === MODERATE LUCK (50-69) ===
        const moderateStatements = [
            `As a ${sign}, you're navigating steady cosmic currents today. Balance is your superpower.`,
            "The universe is working behind the scenes for you. Patience will reveal hidden blessings.",
            "Your path is illuminated with gentle moonlight. Trust the journey you're on.",
            "Moderate fortune surrounds you—stay grounded and watch for subtle signs.",
            "Today brings stability and quiet strength. You're exactly where you need to be.",
            "Life is 10% what happens to you and 90% of how you react to it. React wisely.",
            "Luck is what happens when preparation meets opportunity. Keep preparing.",
            "Small steps today lead to big wins tomorrow."
        ];

        const moderateInsights = [
            "Focus on gratitude—it multiplies your blessings.",
            "A friend may offer valuable advice today.",
            "Stay open to unexpected conversations.",
            "Your resilience is being recognized by the universe.",
            "I am in the right place at the right time.",
            "I trust the timing of my life.",
            "Every experience is valuable for my growth.",
            "I am exactly where I need to be."
        ];

        // === LOW LUCK (30-49) ===
        const lowStatements = [
            "The cosmic energy is asking you to slow down and reflect. Tomorrow's fortunes are the dreams of today.",
            `As a ${sign}, you're being called to conserve your energy. This is a time for inner growth.`,
            "The stars suggest a quiet day ahead. Use this time to recharge your spirit.",
            "Fortune is taking a brief pause—but remember, you are capable of figuring this out.",
            "A gentle reminder from the cosmos: every day can't be extraordinary, and that's okay.",
            "You have to remember that the hard days are what make you stronger.",
            "A bad day doesn't cancel out a good life. Keep going.",
            "This too shall pass. Your comeback story is being written."
        ];

        const lowInsights = [
            "Rest and self-care will amplify tomorrow's luck.",
            "Avoid major decisions—clarity comes with time.",
            "Something you lost may turn up soon.",
            "Embrace the calm; it precedes the storm of success.",
            "Your needs are important and valid. Honor them.",
            "I am resilient and can overcome any obstacle.",
            "Tomorrow holds brighter possibilities.",
            "Every setback is a setup for a comeback."
        ];

        // === VERY LOW LUCK (0-29) ===
        const veryLowStatements = [
            "The celestial bodies are in a protective formation. Lay low and trust that this too shall pass.",
            "Today's chart urges caution, but remember: you are resilient and can overcome any challenge.",
            "The universe is asking you to pause and redirect. Sometimes delay is divine protection.",
            "Low cosmic energy today, but your inner strength remains unshakable. You've got this!",
            "The stars advise patience. Fortune favors those who wait wisely.",
            "Tough times never last, but tough people do. You are tougher than you know.",
            "Our greatest glory is not in never falling, but in rising every time we fall.",
            "Even unlucky days end, but your spirit decides what stays behind."
        ];

        const veryLowInsights = [
            "Postpone risks; focus on what you can control.",
            "Unexpected help may arrive when you least expect it.",
            "Use this time for planning and preparation.",
            "Stars can't shine without darkness. Your light is coming.",
            "Hardships often prepare ordinary people for an extraordinary destiny.",
            "The best view comes after the hardest climb.",
            "Resilience is stitched together from the fabric of unlucky moments.",
            "A run of bad luck is only a detour, not a destination."
        ];

        // Select statement and insight based on percentage (directly!)
        let fortuneStatement, cosmicInsight;

        if (percentage >= 85) {
            fortuneStatement = exceptionalStatements[percentage % exceptionalStatements.length];
            cosmicInsight = exceptionalInsights[percentage % exceptionalInsights.length];
        } else if (percentage >= 70) {
            fortuneStatement = greatStatements[percentage % greatStatements.length];
            cosmicInsight = greatInsights[percentage % greatInsights.length];
        } else if (percentage >= 50) {
            fortuneStatement = moderateStatements[percentage % moderateStatements.length];
            cosmicInsight = moderateInsights[percentage % moderateInsights.length];
        } else if (percentage >= 30) {
            fortuneStatement = lowStatements[percentage % lowStatements.length];
            cosmicInsight = lowInsights[percentage % lowInsights.length];
        } else {
            fortuneStatement = veryLowStatements[percentage % veryLowStatements.length];
            cosmicInsight = veryLowInsights[percentage % veryLowInsights.length];
        }

        const fullExplanation = `${fortuneStatement}\n\n✨ ${cosmicInsight}\n\nYour ${sign} cosmic profile suggests unique energy shifts are active for you today.`;

        return {
            text: fullExplanation,
            traits: selectedTraits
        };
    }

    // Update zodiac display
    function updateZodiac() {
        if (!dob) {
            document.getElementById('zodiac-display').classList.add('zodiac-hidden');
            return;
        }

        const [y, m, d] = dob.split('-').map(Number);
        const zodiac = getZodiacSign(d, m);

        document.getElementById('zodiac-name').textContent = zodiac.name;
        document.getElementById('zodiac-icon').textContent = zodiac.icon;
        document.getElementById('zodiac-display').classList.remove('zodiac-hidden');
    }

    // Animate percentage counter
    function animatePercentage(target) {
        let current = 0;
        const duration = 1500;
        const steps = 60;
        const stepTime = duration / steps;

        const progressRing = document.querySelector('.progress-ring-fill');
        const circumference = 2 * Math.PI * 90; // radius is 90

        // Update progress ring color based on percentage
        let ringColor;
        if (target >= 70) {
            ringColor = '#4CAF50'; // Green
        } else if (target >= 40) {
            ringColor = 'rgba(255, 230, 128, 1)'; // Gold
        } else {
            ringColor = '#FF9800'; // Orange
        }
        progressRing.style.stroke = ringColor;

        const offset = circumference - (target / 100) * circumference;

        // Reset progress ring
        progressRing.style.strokeDashoffset = circumference;

        let step = 0;
        function update() {
            step++;
            const progress = step / steps;
            current = Math.floor(target * progress);
            resultPercentage.textContent = current;

            if (step < steps) {
                setTimeout(update, stepTime);
            } else {
                resultPercentage.textContent = target;
            }
        }

        setTimeout(() => {
            progressRing.style.strokeDashoffset = offset;
            update();
        }, 100);
    }

    // Event listeners
    function checkInputs() {
        name = nameInput.value.trim();
        dob = dobInput.value;

        updateZodiac();
        revealBtn.disabled = !(name && dob);
    }

    nameInput.addEventListener('input', checkInputs);
    dobInput.addEventListener('input', checkInputs);
    dobInput.addEventListener('change', checkInputs);

    revealBtn.addEventListener('click', async () => {
        if (!name || !dob) return;

        // Try server prototype first; fall back to local deterministic calculation
        let percentage, explanation;
        try {
            const res = await fetch('/api/assess-luck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, dob, optInSignals: { astro: false, history: false } })
            });

            if (!res.ok) throw new Error('server error');

            const data = await res.json();
            percentage = Number(data.percentage);

            // Build an explanation object compatible with existing UI
            explanation = {
                text: data.explanation || `Calibrated score: ${percentage}% (baseline ${data.baseline}%)`,
                traits: (data.factors || []).map(f => f.name)
            };
        } catch (err) {
            console.warn('Server fetch failed, falling back to local calc', err);
            percentage = calculateLuckyPercentage(name, dob);
            explanation = generateLuckExplanation(percentage, name, dob);
        }

        // Update result view with formatted text
        fortuneText.innerHTML = explanation.text.replace(/\n/g, '<br>');

        // Clear and add traits
        traitsList.innerHTML = '';
        (explanation.traits || []).forEach(trait => {
            const tag = document.createElement('span');
            tag.className = 'trait-tag';
            tag.textContent = trait;
            traitsList.appendChild(tag);
        });

        // Switch views
        inputView.classList.remove('active');
        resultView.classList.add('active');

        // Animate after view switch
        setTimeout(() => {
            animatePercentage(percentage);
        }, 300);
    });

    function goBack() {
        resultView.classList.remove('active');
        inputView.classList.add('active');

        // Reset progress ring
        const progressRing = document.querySelector('.progress-ring-fill');
        progressRing.style.strokeDashoffset = 565.48;
        resultPercentage.textContent = '0';
    }

    backBtn.addEventListener('click', goBack);
    tryAgainBtn.addEventListener('click', goBack);


});
