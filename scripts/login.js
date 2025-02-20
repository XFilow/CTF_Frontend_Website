document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const messageContainer = document.getElementById('message-container');

    // Check for the query parameter and display the message if present
    if (urlParams.has('message')) {
        const message = urlParams.get('message');
        if (message === 'password_reset_success') {
            messageContainer.textContent = 'Your password has been updated';
            messageContainer.style.color = 'lime';
            messageContainer.style.borderColor = 'lime';
            messageContainer.style.display = 'block';
        }
    }
    
    // Handle the login form submission
    document.getElementById('login-form').addEventListener('submit', async function(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const response = await fetch('http://cryptotradingflow/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            //messageContainer.textContent = 'Logged in successfully!';
            //messageContainer.style.color = 'lime';
            //messageContainer.style.borderColor = 'lime';
            window.location.href = '/trader'; // !!!!!!!!!!!!!!!!!!!!!!!!!!!!! TODO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        } else {
            messageContainer.textContent = data.message;
            messageContainer.style.color = 'red';
            messageContainer.style.borderColor = 'red';
            messageContainer.style.display = 'block';
        }
    });
});