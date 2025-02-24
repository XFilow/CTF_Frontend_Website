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
        formMessageContainer.textContent = data.message;
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
        codeMessageContainer.textContent = data.message;
        codeMessageContainer.style.color = 'red';
        codeMessageContainer.style.borderColor = 'red';
        codeMessageContainer.style.display = 'block';
    }
});