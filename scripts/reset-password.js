document.addEventListener('DOMContentLoaded', function() {
    const resetEmailForm = document.getElementById('reset-email-form');
    const resetCodeForm = document.getElementById('reset-code-form');
    const resetPasswordForm = document.getElementById('reset-password-form');
    const emailMessageContainer = document.getElementById('reset-email-message');
    const codeMessageContainer = document.getElementById('reset-code-message');
    const passwordMessageContainer = document.getElementById('reset-password-message');

    resetEmailForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        emailMessageContainer.textContent = '';
        codeMessageContainer.textContent = '';
        
        emailMessageContainer.style.border = 'none';
        codeMessageContainer.style.border = 'none';

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
                resetEmailForm.classList.remove('active');
                resetCodeForm.classList.add('active');

                codeMessageContainer.textContent = data.message;
                codeMessageContainer.style.color = 'lime';
                codeMessageContainer.style.borderColor = 'lime';
                codeMessageContainer.style.borderStyle = 'solid';
                codeMessageContainer.style.borderWidth = '1px';
                codeMessageContainer.style.display = 'block';
            } else {
                emailMessageContainer.textContent = data.message;
                emailMessageContainer.style.color = 'red';
                emailMessageContainer.style.borderColor = 'red';
                emailMessageContainer.style.borderStyle = 'solid';
                emailMessageContainer.style.borderWidth = '1px';
                emailMessageContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            emailMessageContainer.textContent = data.message;
            emailMessageContainer.style.color = 'red';
            emailMessageContainer.style.borderColor = 'red';
            emailMessageContainer.style.borderStyle = 'solid';
            emailMessageContainer.style.borderWidth = '1px';
            emailMessageContainer.style.display = 'block';
        }
    });

    resetCodeForm.addEventListener('submit', async function(event) {
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
                resetCodeForm.classList.remove('active');
                resetPasswordForm.classList.add('active');

                passwordMessageContainer.textContent = data.message;
                passwordMessageContainer.style.color = 'lime';
                passwordMessageContainer.style.borderColor = 'lime';
                passwordMessageContainer.style.borderStyle = 'solid';
                passwordMessageContainer.style.borderWidth = '1px';
                passwordMessageContainer.style.display = 'block';
            } else {
                codeMessageContainer.textContent = data.message;
                codeMessageContainer.style.color = 'red';
                codeMessageContainer.style.borderColor = 'red';
                codeMessageContainer.style.borderStyle = 'solid';
                codeMessageContainer.style.borderWidth = '1px';
                codeMessageContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            codeMessageContainer.textContent = data.message;
            codeMessageContainer.style.color = 'red';
            codeMessageContainer.style.borderColor = 'red';
            codeMessageContainer.style.borderStyle = 'solid';
            codeMessageContainer.style.borderWidth = '1px';
            codeMessageContainer.style.display = 'block';
        }
    });

    resetPasswordForm.addEventListener('submit', async function(event) {
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
                window.location.href = 'login?message=success';
            } else {
                passwordMessageContainer.textContent = data.message;
                passwordMessageContainer.style.color = 'red';
                passwordMessageContainer.style.borderColor = 'red';
                passwordMessageContainer.style.borderStyle = 'solid';
                passwordMessageContainer.style.borderWidth = '1px';
                passwordMessageContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            passwordMessageContainer.textContent = data.message;
            passwordMessageContainer.style.color = 'red';
            passwordMessageContainer.style.borderColor = 'red';
            passwordMessageContainer.style.borderStyle = 'solid';
            passwordMessageContainer.style.borderWidth = '1px';
            passwordMessageContainer.style.display = 'block';
        }
    });
});