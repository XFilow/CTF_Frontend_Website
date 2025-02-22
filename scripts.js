document.addEventListener('DOMContentLoaded', function() {
    const rotatingText = document.getElementById('rotating-text');
    const phrases = [
        "Next-gen trading, made for everyone.",
        "Automate your trades like never before.",
        "Get consistent results with our trading strategies.",
        "Join one of the best crypto communities.",
        "Get started now and start earning today."
    ];
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;

    function type() {
        const currentPhrase = phrases[currentPhraseIndex];
        if (isDeleting) {
            rotatingText.innerHTML = currentPhrase.substring(0, currentCharIndex);
            currentCharIndex--;
        } else {
            rotatingText.innerHTML = currentPhrase.substring(0, currentCharIndex);
            currentCharIndex++;
        }

        if (currentCharIndex === 0) {
            isDeleting = false;
            currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        } else if (currentCharIndex === currentPhrase.length + 1) {
            isDeleting = true;
            setTimeout(type, 1500); // Pause before starting to delete
            return;
        }

        setTimeout(type, 70); // Adjust the speed of the typing effect
    }

    type();
});