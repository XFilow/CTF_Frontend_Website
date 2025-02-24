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

    let registerEmail = document.getElementById('email').value;

    const password = document.getElementById('password').value;
    const newRegisterForm = document.getElementById('register-form-container');
    const verifyCodeForm = document.getElementById('code-form-container');
    const formMessageContainer = document.getElementById('register-form-message');
    const codeMessageContainer = document.getElementById('register-code-message');

    // Clear previous messages
    formMessageContainer.textContent = '';
    codeMessageContainer.textContent = '';
    
    try {
        const response = await fetch('http://localhost:5000/register', { //https://cryptotradingflow/register
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: registerEmail, password })
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
            formMessageContainer.textContent = data.message;
            formMessageContainer.style.color = 'red';
            formMessageContainer.style.borderColor = 'red';
            formMessageContainer.style.display = 'block';
        }
    } catch (error) {
        console.error('Error during registration:', error);
        formMessageContainer.textContent = 'An error occurred please try again';
        formMessageContainer.style.color = 'red';
        formMessageContainer.style.borderColor = 'red';
        formMessageContainer.style.display = 'block';
    }
});

document.getElementById('register-code-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const code = document.getElementById('code').value;
    const codeMessageContainer = document.getElementById('register-code-message');

    // Clear previous messages
    codeMessageContainer.textContent = '';

    try {
        const response = await fetch('http://localhost:5000/verify-code', { //https://cryptotradingflow/verify-code
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: registerEmail, code, context: 'registration' })
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
        codeMessageContainer.textContent = 'An error occurred please try again';
        codeMessageContainer.style.color = 'red';
        codeMessageContainer.style.borderColor = 'red';
        codeMessageContainer.style.display = 'block';
    }
});

// Login
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const loginMessageContainer = document.getElementById('login-message');

    // Check for the query parameter and display the message if present
    if (urlParams.has('message')) {
        const message = urlParams.get('message');
        if (message === 'password_reset_success') {
            loginMessageContainer.textContent = 'Your password has been updated';
            loginMessageContainer.style.color = 'lime';
            loginMessageContainer.style.borderColor = 'lime';
            loginMessageContainer.style.display = 'block';
        }
    }

    // Handle the login form submission
    document.getElementById('login-form').addEventListener('submit', async function(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('http://localhost:5000/login', { //https://cryptotradingflow/login
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = '/trader'; // Ensure this URL is correct
            } else {
                loginMessageContainer.textContent = data.message;
                loginMessageContainer.style.color = 'red';
                loginMessageContainer.style.borderColor = 'red';
                loginMessageContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('Error during login:', error);
            loginMessageContainer.textContent = 'An error occurred please try again.';
            loginMessageContainer.style.color = 'red';
            loginMessageContainer.style.borderColor = 'red';
            loginMessageContainer.style.display = 'block';
        }
    });
});

// Reset-password
document.addEventListener('DOMContentLoaded', function() {
    const requestCodeForm = document.getElementById('request-code-form');
    const verifyCodeForm = document.getElementById('verify-code-form');
    const newPasswordForm = document.getElementById('new-password-form');
    const enterEmailForm = document.getElementById('enter-email-form');
    const enterCodeForm = document.getElementById('enter-code-form');
    const resetPasswordForm = document.getElementById('reset-password-form');
    const emailMessageContainer = document.getElementById('email-message-container');
    const codeMessageContainer = document.getElementById('code-message-container');
    const passwordMessageContainer = document.getElementById('password-message-container');

    requestCodeForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        emailMessageContainer.textContent = '';
        codeMessageContainer.textContent = '';

        let resetEmail = document.getElementById('email').value;

        try {
            const response = await fetch('http://localhost:5000/reset-password', { //https://cryptotradingflow.com/reset-password
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: resetEmail })
            });

            const data = await response.json();

            if (response.ok) {
                enterEmailForm.classList.remove('active');
                enterCodeForm.classList.add('active');

                codeMessageContainer.textContent = data.message;
                codeMessageContainer.style.color = 'lime';
                codeMessageContainer.style.borderColor = 'lime';
                codeMessageContainer.style.display = 'block';
            } else {
                emailMessageContainer.textContent = data.message;
                emailMessageContainer.style.color = 'red';
                emailMessageContainer.style.borderColor = 'red';
                emailMessageContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            emailMessageContainer.textContent = 'An error occurred please try again';
            emailMessageContainer.style.color = 'red';
            emailMessageContainer.style.borderColor = 'red';
            emailMessageContainer.style.display = 'block';
        }
    });

    verifyCodeForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const code = document.getElementById('code').value;

        codeMessageContainer.textContent = '';
        passwordMessageContainer.textContent = '';

        try {
            const response = await fetch('http://localhost:5000/verify-code', { //https://cryptotradingflow.com/verify-code
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: resetEmail, code, context: 'password-reset' })
            });

            const data = await response.json();

            if (response.ok) {
                enterCodeForm.classList.remove('active');
                resetPasswordForm.classList.add('active');

                passwordMessageContainer.textContent = 'Code verified successfully for password reset';
                passwordMessageContainer.style.color = 'lime';
                passwordMessageContainer.style.borderColor = 'lime';
            } else {
                codeMessageContainer.textContent = data.message;
                codeMessageContainer.style.color = 'red';
                codeMessageContainer.style.borderColor = 'red';
                codeMessageContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            codeMessageContainer.textContent = 'An error occurred please try again';
            codeMessageContainer.style.color = 'red';
            codeMessageContainer.style.borderColor = 'red';
            codeMessageContainer.style.display = 'block';
        }
    });

    newPasswordForm.addEventListener('submit', async function(event) {
        event.preventDefault();
    
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        passwordMessageContainer.textContent = '';
    
        try {
            const response = await fetch('http://localhost:5000/new-password', { //https://cryptotradingflow.com/new-password
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: resetEmail, newPassword, confirmPassword })
            });
    
            const data = await response.json();
    
            if (response.ok) {
                window.location.href = 'login?message=password_reset_success';
            } else {
                passwordMessageContainer.textContent = data.message;
                passwordMessageContainer.style.color = 'red';
                passwordMessageContainer.style.borderColor = 'red';
                passwordMessageContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            passwordMessageContainer.textContent = 'An error occurred please try again';
            passwordMessageContainer.style.color = 'red';
            passwordMessageContainer.style.borderColor = 'red';
            passwordMessageContainer.style.display = 'block';
        }
    });
});