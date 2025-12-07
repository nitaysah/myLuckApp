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

    // Logic ported from Swift myLuckLogic.swift
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

    function stringHash(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
        }
        return hash;
    }

    function calculateLuckyPercentage(nameStr, dobStr) {
        const [year, month, day] = dobStr.split('-').map(Number);

        const lifePathNumber = reduceToSingleDigit(day) + reduceToSingleDigit(month) + reduceToSingleDigit(year);
        const finalLifePath = reduceToSingleDigit(lifePathNumber);

        const now = new Date();
        const dailyString = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`;

        const nameLower = nameStr.toLowerCase();
        let nameSum = 0;
        for (let i = 0; i < nameLower.length; i++) {
            nameSum += nameLower.charCodeAt(i);
        }

        const combinedString = `${finalLifePath}-${nameSum}-${dailyString}`;
        const hash = stringHash(combinedString);

        const percentage = Math.abs(hash) % 101;
        return percentage;
    }

    // Zodiac Logic - matching iOS app
    const zodiacData = {
        "Aries": { icon: "♈️", element: "Fire", traits: ["Bold", "Ambitious", "Energetic"] },
        "Taurus": { icon: "♉️", element: "Earth", traits: ["Reliable", "Patient", "Devoted"] },
        "Gemini": { icon: "♊️", element: "Air", traits: ["Curious", "Adaptable", "Witty"] },
        "Cancer": { icon: "♋️", element: "Water", traits: ["Intuitive", "Loyal", "Caring"] },
        "Leo": { icon: "♌️", element: "Fire", traits: ["Creative", "Passionate", "Generous"] },
        "Virgo": { icon: "♍️", element: "Earth", traits: ["Analytical", "Practical", "Diligent"] },
        "Libra": { icon: "♎️", element: "Air", traits: ["Diplomatic", "Fair", "Social"] },
        "Scorpio": { icon: "♏️", element: "Water", traits: ["Determined", "Brave", "Loyal"] },
        "Sagittarius": { icon: "♐️", element: "Fire", traits: ["Optimistic", "Adventurous", "Free"] },
        "Capricorn": { icon: "♑️", element: "Earth", traits: ["Disciplined", "Ambitious", "Wise"] },
        "Aquarius": { icon: "♒️", element: "Air", traits: ["Progressive", "Original", "Humanitarian"] },
        "Pisces": { icon: "♓️", element: "Water", traits: ["Artistic", "Intuitive", "Compassionate"] }
    };

    function getZodiacSign(day, month) {
        const zodiacSigns = [
            "Capricorn", "Aquarius", "Pisces", "Aries", "Taurus", "Gemini",
            "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius"
        ];
        const cutoffDates = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];

        let signIndex = month - 1;
        if (day < cutoffDates[signIndex]) {
            signIndex = (signIndex - 1 + 12) % 12;
        }
        return zodiacSigns[signIndex];
    }

    // Fortune explanation generator - matching iOS app
    function generateLuckExplanation(percentage, nameStr, dobStr) {
        const [year, month, day] = dobStr.split('-').map(Number);
        const sign = getZodiacSign(day, month);
        const signData = zodiacData[sign];

        const now = new Date();
        const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

        let explanation = "";

        if (percentage >= 80) {
            explanation = `Incredible cosmic alignment today, ${nameStr}! As a ${sign}, your ${signData.element} energy is radiating at peak levels. The stars suggest this ${dayOfWeek} holds exceptional fortune for you. Trust your instincts and embrace opportunities!`;
        } else if (percentage >= 60) {
            explanation = `Great energy surrounds you today, ${nameStr}! Your ${sign} nature is well-aligned with today's celestial patterns. This ${dayOfWeek} favors bold decisions and meaningful connections.`;
        } else if (percentage >= 40) {
            explanation = `A balanced day awaits, ${nameStr}. As a ${sign}, you're in harmony with the universe's rhythm today. This ${dayOfWeek} is perfect for reflection and steady progress.`;
        } else if (percentage >= 20) {
            explanation = `The cosmos suggests a contemplative ${dayOfWeek}, ${nameStr}. Your ${sign} wisdom will guide you through any challenges. Focus on self-care and patience today.`;
        } else {
            explanation = `Today calls for inner strength, ${nameStr}. As a ${sign}, your ${signData.element} resilience will see you through. Use this ${dayOfWeek} for planning and preparation.`;
        }

        return explanation;
    }

    // Get cosmic traits for the day
    function getCosmicTraits(percentage, sign) {
        const signData = zodiacData[sign];
        const baseTraits = [...signData.traits];

        const bonusTraits = {
            high: ["✨ Magnetic Aura", "🌟 Peak Intuition", "💫 Lucky Streaks"],
            medium: ["🔮 Clear Vision", "⭐ Good Timing", "🌙 Balanced Energy"],
            low: ["🛡️ Inner Strength", "🌿 Growth Mindset", "💭 Deep Wisdom"]
        };

        let level = percentage >= 60 ? 'high' : (percentage >= 30 ? 'medium' : 'low');
        const extraTraits = bonusTraits[level].slice(0, 2);

        return [...baseTraits.map(t => `${signData.icon} ${t}`), ...extraTraits];
    }

    // Update zodiac display
    function updateZodiac() {
        if (!dob) {
            document.getElementById('zodiac-display').classList.add('zodiac-hidden');
            return;
        }

        const [y, m, d] = dob.split('-').map(Number);
        const sign = getZodiacSign(d, m);
        const signData = zodiacData[sign];

        document.getElementById('zodiac-name').textContent = sign;
        document.getElementById('zodiac-icon').textContent = signData.icon;
        document.getElementById('zodiac-display').classList.remove('zodiac-hidden');
    }

    // Animate percentage counter
    function animatePercentage(target) {
        let current = 0;
        const duration = 1500;
        const increment = target / (duration / 16);

        const progressRing = document.querySelector('.progress-ring-fill');
        const circumference = 2 * Math.PI * 90; // radius is 90
        const offset = circumference - (target / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;

        function update() {
            current += increment;
            if (current >= target) {
                resultPercentage.textContent = target;
                return;
            }
            resultPercentage.textContent = Math.floor(current);
            requestAnimationFrame(update);
        }

        // Reset progress ring
        progressRing.style.strokeDashoffset = circumference;
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

    revealBtn.addEventListener('click', () => {
        if (!name || !dob) return;

        const percentage = calculateLuckyPercentage(name, dob);
        const explanation = generateLuckExplanation(percentage, name, dob);

        const [y, m, d] = dob.split('-').map(Number);
        const sign = getZodiacSign(d, m);
        const traits = getCosmicTraits(percentage, sign);

        // Update result view
        fortuneText.textContent = explanation;

        // Clear and add traits
        traitsList.innerHTML = '';
        traits.forEach(trait => {
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

    // Set default date to 25 years ago (matching iOS app)
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 25);
    dobInput.valueAsDate = defaultDate;
});
