document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const navLinks = document.querySelectorAll('.sidebar-menu ul li a');
    const userDropdownToggle = document.getElementById('user-dropdown-toggle');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    const userIcon = document.getElementById('user-icon');

    let traderInfo = null;

    // Call the function to fetch and store the data
    fetchAndStoreTraderInfo();

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const contentId = event.currentTarget.getAttribute('data-content');
            updateHeaderAndContent(event, contentId);
        });
    });

    async function fetchAndStoreTraderInfo() {
        traderInfo = await fetchTraderInfo();
        if(traderInfo) {
            const displayName = traderInfo.username || traderInfo.email;
            userDropdownToggle.textContent = displayName;
            console.log('Trader Info:', traderInfo);
        } else {
            logout();
        }
    }

    async function fetchTraderInfo() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return null; // Return null if the user is not logged in
        }

        try {
            const response = await fetch('http://localhost:5000/trader/info', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const traderInfo = await response.json();
                return traderInfo; // Return the user info
            } else {
                console.log('Not authenticated or error fetching data');
                return null; // Return null if there's an error
            }
        } catch (error) {
            console.error('Error fetching trader info:', error);
            return null; // Return null in case of an exception
        }
    }

    // Update body content and header title
    function updateHeaderAndContent(event, contentId) {
        event.preventDefault();

        const headerTitle = document.querySelector('.content-header h1');

        if (!contentId) return;

        const selectedText = event.currentTarget.textContent;
        headerTitle.textContent = selectedText;

        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        const sectionToShow = document.getElementById(contentId);
        if (sectionToShow) {
            sectionToShow.style.display = 'block';
        }

        if (contentId === 'profile-content') {
            updateProfile()
        }
        else if (contentId === 'dashboard-content') {
            updateDashboard()
        }
        else if (contentId === 'exchanges-content') {
            updateExchanges()
        }
    }

    function updateProfile() {
        document.querySelector('.profile-username').textContent = traderInfo.username;
        document.querySelector('.profile-email').textContent = traderInfo.email;
        document.querySelector('.profile-registration').textContent = new Date(traderInfo.register_date).toLocaleString('default', { month: 'long', year: 'numeric' });
    }
    function updateDashboard() {

    }
    function updateExchanges() {
        document.getElementById('new-exchange-container').classList.remove('active');
        document.getElementById('add-exchange-container').classList.add('active');
    }

    function logout() {
        localStorage.removeItem('token');
        console.log('Logged out');
        window.location.href = 'login?message=logout';
    }

    // Sidebar expansion
    sidebarToggle.addEventListener('click', function() {
        const menuTexts = document.querySelectorAll('.sidebar-menu a span');
        const sidebarTitle = document.querySelector('.sidebar-title');
        const mainContent = document.getElementById('main-content');
        const sidebar = document.querySelector('.sidebar');

        sidebar.classList.toggle('expanded');
        mainContent.classList.toggle('expanded');
        document.body.classList.toggle('icons-only');

        sidebarTitle.style.display = sidebarTitle.style.display === 'none' ? 'block' : 'none';
        menuTexts.forEach(text => {
            text.style.display = text.style.display === 'none' ? 'inline' : 'none';
        });
    });

    function toggleDropdownMenu() {
        userDropdownMenu.style.display = userDropdownMenu.style.display === 'block' ? 'none' : 'block';
    }

    // User menu
    userDropdownToggle.addEventListener('click', toggleDropdownMenu);
    userIcon.addEventListener('click', toggleDropdownMenu);

    userDropdownMenu.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', function(event) {
            const contentId = event.currentTarget.getAttribute('data-content');
            const logout = document.getElementById('logout');

            if (event.currentTarget === logout) {
                logout();
            } else if (contentId) {
                updateHeaderAndContent(event, contentId);
            }

            userDropdownMenu.style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (!userDropdownToggle.contains(event.target) && !userIcon.contains(event.target) && !userDropdownMenu.contains(event.target)) {
            userDropdownMenu.style.display = 'none';
        }
    });

    // Handle the profile changes
    document.getElementById('save-profile-button').addEventListener('click', async function() {
        try {
            const newUsername = document.getElementById('change-name').value;
            const nameTakenError = document.getElementById('name-taken-error');
            const pictureInput = document.getElementById('change-picture');
            const fileSizeError = document.getElementById('file-size-error');
            const newPicture = pictureInput.files.length > 0 ? pictureInput.files[0] : null;

            // Change username
            if (newUsername) {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/trader/username', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ newUsername })
                });

                if (response.ok) {
                    nameTakenError.textContent = ''; // Clear any previous error message
                    userDropdownToggle.textContent = newUsername;
                    document.querySelector('.profile-username').textContent = newUsername;
                    console.log('Profile has been updated.');
                } else {
                    const errorData = await response.json();
                    nameTakenError.textContent = errorData.message;
                    console.error(`Failed to update profile: ${errorData.message}`);
                }
            }

            // Change picture
            if (newPicture) {
                const maxSizeKB = 300; // Max size in kilobytes

                if (newPicture.size > maxSizeKB * 1024) {
                    fileSizeError.textContent = 'File size exceeds 300KB';
                } else {
                    fileSizeError.textContent = ''; // Clear any previous error message

                    // Read and display the image
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        userIcon.src = e.target.result;
                    };
                    reader.readAsDataURL(newPicture);
                }
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    });

    // Terminate Account
    document.getElementById('terminate-profile-button').addEventListener('click', async function() {
        const confirmed = confirm('Are you sure you want to terminate your account? This action cannot be undone.');

        if (confirmed) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/trader/terminate-account', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    // Clear local storage or perform any other cleanup
                    localStorage.removeItem('token');
                    alert('Your account has been terminated.');
                    window.location.href = 'login?message=account-terminated';
                } else {
                    const errorData = await response.json();
                    alert(`Failed to terminate account: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Error terminating account:', error);
                alert('An error occurred while terminating your account.');
            }
        }
    });

    // Change password button
    document.getElementById('change-password-button').addEventListener('click', function() {
        localStorage.removeItem('token');
        console.log('Logged out');
        window.location.href = '/reset-password';
    });

    // Add exchange button
    document.getElementById('add-exchange-button').addEventListener('click', function () {
        document.getElementById('add-exchange-container').classList.remove('active');
        document.getElementById('new-exchange-container').classList.add('active');
    });

    // New API form submission
    document.getElementById('new-api-exchange').addEventListener('submit', function(event) {
        // Prevent the default form submission
        event.preventDefault();

        // Get the form elements
        const exchange = document.getElementById('new-exchange').value;
        const accountName = document.getElementById('new-exchange-account-name').value;
        const apiKey = document.getElementById('new-exchange-api-key').value;
        const apiSecret = document.getElementById('new-exchange-api-secret').value;

        // Validate the form fields
        if (!exchange || !accountName || !apiKey || !apiSecret) {
            alert('All fields are required to create a new API.');
            return;
        }

        // If all fields are filled, you can proceed with form submission
        console.log('Form submitted successfully');

        // Optionally, you can submit the form data to the server here
        // fetch('/api/new-exchange', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ exchange, accountName, apiKey, apiSecret })
        // })
        // .then(response => response.json())
        // .then(data => console.log('Success:', data))
        // .catch(error => console.error('Error:', error));

        updateExchanges();
    });
});