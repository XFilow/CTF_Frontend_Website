document.addEventListener('DOMContentLoaded', function() {
    const resetEmailForm = document.getElementById('reset-email-container');
    const resetCodeForm = document.getElementById('reset-code-container');
    const resetPasswordForm = document.getElementById('reset-password-container');
    const emailMessageContainer = document.getElementById('reset-email-message');
    const codeMessageContainer = document.getElementById('reset-code-message');
    const passwordMessageContainer = document.getElementById('reset-password-message');

    let resetEmail = '';

    // Check if elements exist before adding event listeners
    if (resetEmailForm) {
        resetEmailForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            emailMessageContainer.textContent = '';
            codeMessageContainer.textContent = '';

            resetEmail = document.getElementById('email').value.trim();

            try {
                const response = await fetch('https://api.cryptotradingflow.com/reset-password', {
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
    } 

    if (resetCodeForm) {
        resetCodeForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const code = document.getElementById('code').value.trim();

            codeMessageContainer.textContent = '';
            passwordMessageContainer.textContent = '';

            try {
                const response = await fetch('https://api.cryptotradingflow.com/verify-code', {
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
                    passwordMessageContainer.style.display = 'block';
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
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const newPassword = document.getElementById('new-password').value.trim();
            const confirmPassword = document.getElementById('confirm-password').value.trim();

            passwordMessageContainer.textContent = '';

            try {
                const response = await fetch('https://api.cryptotradingflow.com/new-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: resetEmail, newPassword, confirmPassword })
                });

                const data = await response.json();

                if (response.ok) {
                    window.location.href = 'login?message=reset';
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
    }
});