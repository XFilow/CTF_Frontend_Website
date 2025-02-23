// Index
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

//Register
document.getElementById('register-email-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const newRegisterForm = document.getElementById('register-form-container');
    const verifyCodeForm = document.getElementById('code-form-container');
    const registerMessageContainer = document.getElementById('register-message');
    const codeMessageContainer = document.getElementById('register-code-message');

    // Clear previous messages
    registerMessageContainer.textContent = '';
    codeMessageContainer.textContent = '';
    
    try {
        const response = await fetch('http://localhost:5000/register', { //https://cryptotradingflow/register
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            newRegisterForm.classList.remove('active');
            verifyCodeForm.classList.add('active');

            codeMessageContainer.textContent = data.message;
            codeMessageContainer.style.color = 'lime';
            codeMessageContainer.style.borderColor = 'lime';
            codeMessageContainer.style.display = 'block';
        } else {
            registerMessageContainer.textContent = data.message;
            registerMessageContainer.style.color = 'red';
            registerMessageContainer.style.borderColor = 'red';
            registerMessageContainer.style.display = 'block';
        }
    } catch (error) {
        console.error('Error during registration:', error);
        registerMessageContainer.textContent = 'An error occurred. Please try again.';
        registerMessageContainer.style.color = 'red';
        registerMessageContainer.style.borderColor = 'red';
        registerMessageContainer.style.display = 'block';
    }
});

document.getElementById('register-code-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const code = document.getElementById('code').value;
    const codeMessageContainer = document.getElementById('register-code-message');

    // Clear previous messages
    codeMessageContainer.textContent = '';

    try {
        const response = await fetch('http://localhost:5000/register', { //https://cryptotradingflow/verify-code
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, context: 'registration' })
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = '/trader';
        } else {
            codeMessageContainer.textContent = data.message;    
            codeMessageContainer.style.color = 'red';
            codeMessageContainer.style.borderColor = 'red';
            codeMessageContainer.style.display = 'block';
        }
    } catch (error) {
        console.error('Error during code verification:', error);
        codeMessageContainer.textContent = 'An error occurred. Please try again.';
        codeMessageContainer.style.color = 'red';
        codeMessageContainer.style.borderColor = 'red';
        codeMessageContainer.style.display = 'block';
    }
});

