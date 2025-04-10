document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const loginMessageContainer = document.getElementById('login-message');

    // Check for the query parameter and display the message if present
    if (urlParams.has('message')) {
        const message = urlParams.get('message');
        if (message === 'register') {
            loginMessageContainer.textContent = 'Your email has been registered';
            loginMessageContainer.style.color = 'lime';
            loginMessageContainer.style.borderColor = 'lime';
            loginMessageContainer.style.display = 'block';
        }
        else if (message === 'reset') {
            loginMessageContainer.textContent = 'Your password has been updated';
            loginMessageContainer.style.color = 'lime';
            loginMessageContainer.style.borderColor = 'lime';
            loginMessageContainer.style.display = 'block';
        }
        else if(message === 'logout') {
            loginMessageContainer.textContent = 'Successfully logged out';
            loginMessageContainer.style.color = 'lime';
            loginMessageContainer.style.borderColor = 'lime';
            loginMessageContainer.style.display = 'block';
        }
        else if(message === 'terminated') {
            loginMessageContainer.textContent = 'Your account was terminated';
            loginMessageContainer.style.color = 'red';
            loginMessageContainer.style.borderColor = 'red';
            loginMessageContainer.style.display = 'block';
        }
    }

    // Handle the login form submission
    document.getElementById('login-form').addEventListener('submit', async function(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        try {
            const response = await fetch('https://api.cryptotradingflow.com/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                //loginMessageContainer.textContent = data.message;
                //loginMessageContainer.style.color = 'lime';
                //loginMessageContainer.style.borderColor = 'lime';
                //loginMessageContainer.style.display = 'block';
                
                localStorage.setItem('token', data.token);
                console.log('Login successful');
                
                window.location.href = '/trader';
            } else {
                loginMessageContainer.textContent = data.message;
                loginMessageContainer.style.color = 'red';
                loginMessageContainer.style.borderColor = 'red';
                loginMessageContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('Error during login:', error);
            loginMessageContainer.textContent = 'An error occurred please try again';
            loginMessageContainer.style.color = 'red';
            loginMessageContainer.style.borderColor = 'red';
            loginMessageContainer.style.display = 'block';
        }
    });
});