document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mainContent = document.getElementById('main-content');
    const sidebar = document.querySelector('.sidebar');
    const headerTitle = document.querySelector('.content-header h1');
    const menuTexts = document.querySelectorAll('.sidebar-menu a span');
    const sidebarTitle = document.querySelector('.sidebar-title');
    const navLinks = document.querySelectorAll('.sidebar-menu ul li a');
    const dropdownToggle = document.getElementById('user-menu-toggle');
    const dropdownMenu = document.getElementById('user-menu-dropdown');
    const nameTakenError = document.getElementById('name-taken-error');
    const fileSizeError = document.getElementById('file-size-error');
    const userIcon = document.getElementById('user-icon');
    const logout = document.getElementById('logout');
    
    let traderInfo = null;

    // Call the function to fetch and store the data
    fetchAndStoreTraderInfo();
    
    async function fetchAndStoreTraderInfo() {
        traderInfo = await fetchTraderInfo();
        if(traderInfo) {
            const displayName = traderInfo.username || traderInfo.email;
            dropdownToggle.textContent = displayName;
            console.log('Trader Info:', traderInfo);
        }
    }

    function updateHeaderAndContent(event, contentId) {
        event.preventDefault();
    
        if (!contentId) return;
    
        const selectedText = event.currentTarget.textContent;
        headerTitle.textContent = selectedText;
    
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
    
        const sectionToShow = document.getElementById(contentId);
        if (sectionToShow) {
            sectionToShow.style.display = 'block';
            //console.log('Showing section:', contentId);
        }
    
        if (contentId === 'profile-content') {
            //fetchProfileInfo();
            document.querySelector('.profile-username').textContent = traderInfo.username;
            document.querySelector('.profile-email').textContent = traderInfo.email;
            document.querySelector('.profile-registration').textContent = new Date(traderInfo.register_date).toLocaleString('default', { month: 'long', year: 'numeric' });
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const contentId = event.currentTarget.getAttribute('data-content');
            updateHeaderAndContent(event, contentId);
        });
    });

    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('expanded');
        mainContent.classList.toggle('expanded');
        document.body.classList.toggle('icons-only');

        sidebarTitle.style.display = sidebarTitle.style.display === 'none' ? 'block' : 'none';
        menuTexts.forEach(text => {
            text.style.display = text.style.display === 'none' ? 'inline' : 'none';
        });
    });

    function toggleDropdownMenu() {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    }

    dropdownToggle.addEventListener('click', toggleDropdownMenu);
    userIcon.addEventListener('click', toggleDropdownMenu);

    dropdownMenu.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', function(event) {
            const contentId = event.currentTarget.getAttribute('data-content');
    
            if (event.currentTarget === logout) {
                localStorage.removeItem('token');
                console.log('Logged out');
                window.location.href = 'login?message=logout';
            } else if (contentId) {
                updateHeaderAndContent(event, contentId);
            }
    
            dropdownMenu.style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (!dropdownToggle.contains(event.target) && !userIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

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

    // Handle the profile form submission
    document.getElementById('save-profile-button').addEventListener('click', async function() {
        try {
            const username = document.getElementById('change-name').value;
            const pictureInput = document.getElementById('change-picture');
            const newPicture = pictureInput.files.length > 0 ? pictureInput.files[0] : null;
    
            // Change username
            if (username) {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/trader/username', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username })
                });
    
                if (response.ok) {
                    nameTakenError.textContent = ''; // Clear any previous error message
                    dropdownToggle.textContent = username;
                    document.querySelector('.profile-username').textContent = username;
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
});