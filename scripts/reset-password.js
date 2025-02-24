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