document.addEventListener('DOMContentLoaded', function() {
    const registerEmailForm = document.getElementById('register-email-form');
    const registerCodeForm = document.getElementById('register-code-form');
    const formMessageContainer = document.getElementById('register-form-message');
    const codeMessageContainer = document.getElementById('register-code-message');

    let registerEmail = '';

    if (registerEmailForm) {
        registerEmailForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent the default form submission

            registerEmail = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const newRegisterForm = document.getElementById('register-form-container');
            const verifyCodeForm = document.getElementById('code-form-container');

            // Clear previous messages
            clearMessageStyles(formMessageContainer);
            clearMessageStyles(codeMessageContainer);

            try {
                const response = await fetch('https://api.cryptotradingflow.com/register', {
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
    }

    if (registerCodeForm) {
        registerCodeForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent the default form submission

            const code = document.getElementById('code').value.trim();

            // Clear previous messages
            clearMessageStyles(codeMessageContainer);

            try {
                const response = await fetch('https://api.cryptotradingflow.com/verify-code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: registerEmail, code, context: 'register' })
                });

                const data = await response.json();

                if (response.ok) {
                    window.location.href = 'login?message=register';
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
    }
    
    function clearMessageStyles(container) {
        container.textContent = '';
        container.style.display = 'none';
        container.style.color = '';
        container.style.borderColor = '';
    }
});