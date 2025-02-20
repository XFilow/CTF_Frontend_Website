document.getElementById('register-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const newRegisterForm = document.getElementById('new-register-form');
    const verifyCodeForm = document.getElementById('verify-code-form');
    const registerMessageContainer = document.getElementById('register-message-container');
    const codeMessageContainer = document.getElementById('code-message-container');

    // Clear previous messages
    registerMessageContainer.textContent = '';
    codeMessageContainer.textContent = '';

    const response = await fetch('http://cryptotradingflow/register', {
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
});

document.getElementById('verify-code-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const code = document.getElementById('code').value;
    const codeMessageContainer = document.getElementById('code-message-container');

    // Clear previous messages
    codeMessageContainer.textContent = '';

    const response = await fetch('http://cryptotradingflow/verify-code', {
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
});