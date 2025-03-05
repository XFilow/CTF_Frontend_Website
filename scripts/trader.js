document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const navLinks = document.querySelectorAll('.sidebar-menu ul li a');
    const userDropdownToggle = document.getElementById('user-dropdown-toggle');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    const userIcon = document.getElementById('user-icon');

    let traderInfo = null;

    // Call the function to fetch and store the data
    fetchAndStoreTraderInfo();
    updateDashboard();
    
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

    async function updateDashboard() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return null; // Return null if the user is not logged in
        }
    
        const exchanges = ['binance']; // Add more exchanges when implemented
    
        try {
            const response = await fetch(`http://localhost:5000/trader/balance?exchange=${exchanges.join(',')}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                console.error('Failed to fetch exchange data:', response.statusText);
                return;
            }
    
            const data = await response.json();
            console.log('Updated Dashboard Data:', data); // Debugging
    
            // Iterate over the object keys (exchange names)
            for (const exchange in data) {
                if (data.hasOwnProperty(exchange) && data[exchange].message !== 'No exchange data' && Object.keys(data[exchange]).length > 0) {
                    const exchangeData = data[exchange];
    
                    // Find the corresponding container dynamically
                    const exchangeFuturesBalance = document.getElementById(`${exchange}-futures-balance`);
                    
                    if (!exchangeFuturesBalance) {
                        console.log(`No container found for exchange: ${exchange}`);
                        continue; // Skip if the container doesn't exist
                    }
    
                    // Clear existing balances for this exchange
                    exchangeFuturesBalance.innerHTML = ''; 
    
                    // Create a paragraph for each coin with a balance greater than 0
                    for (const asset in exchangeData) {
                        if (exchangeData.hasOwnProperty(asset) && parseFloat(exchangeData[asset]) > 0) {
                            const p = document.createElement('p');
                            p.textContent = `${exchangeData[asset]} ${asset.toUpperCase()}`;
                            exchangeFuturesBalance.appendChild(p);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching exchange data:', error);
        }
    }

    async function updateExchanges() {
        document.getElementById('new-exchange-container').classList.remove('active');
        document.getElementById('add-exchange-container').classList.add('active');
        document.getElementById('new-exchange').value = '';
        document.getElementById('new-exchange-account-name').value = '';
        document.getElementById('new-exchange-api-key').value = '';
        document.getElementById('new-exchange-api-secret').value = '';
        document.getElementById('exchange-message').textContent = '';
        //exchangeMessageContainer.classList.add('no-border');

        // Update the table with the received data
        const tableBody = document.getElementById("exchanges-tbody");
        // List of exchanges to fetch
        const exchanges = ['binance']; //, 'coinbase'

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return null; // Return null if the user is not logged in
        }

        try {
            const response = await fetch(`http://localhost:5000/trader/exchange?exchange=${exchanges.join(',')}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Failed to fetch exchange data:', response.statusText);
                return;
            }

            const data = await response.json();
            //console.log('Updated Exchange Data:', data); // Debugging

            // Clear existing table rows
            tableBody.innerHTML = "";
        
            // Iterate over the object keys
            for (const exchange in data) {
                if (data.hasOwnProperty(exchange) && data[exchange].message !== 'No exchange data' && Object.keys(data[exchange]).length > 0) {
                    const exchangeData = data[exchange];
                    const row = document.createElement("tr");

                    row.innerHTML = `
                        <td>${exchangeData.exchange_name}</td>
                        <td>${exchangeData.account_name}</td>
                        <td>${exchangeData.api_key}</td>
                        <td>
                            <button class="table-edit-button" onclick="editExchange('${exchange}')">Edit</button>
                            <button class="table-delete-button" onclick="deleteExchange('${exchange}')">Delete</button>
                        </td>
                    `;

                    tableBody.appendChild(row);
                    if (tableBody.children.length > 0) {
                        tableBody.classList.add('has-data'); // Make tbody visible
                    } else {
                        tableBody.classList.remove('has-data'); // Keep it hidden if empty
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching exchange data:', error);
        }
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

    // Titles toggle
    document.querySelectorAll('.card-title').forEach(title => {
        title.addEventListener('click', function() {
            const content = this.nextElementSibling;
            if (content.classList.contains('collapsed')) {
                content.classList.remove('collapsed');
                this.classList.remove('collapsed');
            } else {
                content.classList.add('collapsed');
                this.classList.add('collapsed');
            }
        });
    });

    // Add exchange button
    document.getElementById('add-exchange-button').addEventListener('click', function () {
        document.getElementById('add-exchange-container').classList.remove('active');
        document.getElementById('new-exchange-container').classList.add('active');
    });

    // New Exchange API form submission
    document.getElementById('new-api-exchange').addEventListener('submit', async function(event) {
        // Prevent the default form submission
        event.preventDefault();

        // Get the form elements
        const exchangeMessageContainer = document.getElementById('exchange-message');
        const exchange = document.getElementById('new-exchange').value;
        const accountName = document.getElementById('new-exchange-account-name').value;
        const apiKey = document.getElementById('new-exchange-api-key').value;
        const apiSecret = document.getElementById('new-exchange-api-secret').value;

        try {
            // Validate the form fields
            if (!exchange || !accountName || !apiKey || !apiSecret) {
                exchangeMessageContainer.textContent = 'All fields are required to create a new API';
                exchangeMessageContainer.style.color = 'red';
                //exchangeMessageContainer.style.borderColor = 'red';
                exchangeMessageContainer.style.display = 'block';
                //alert('All fields are required to create a new API.');
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                console.log('User is not logged in');
                return null;
            }

            const getResponse = await fetch(`http://localhost:5000/trader/exchange?exchange=${exchange}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (getResponse.ok) {
                const exchangeData = await getResponse.json();
            
                if (exchangeData[exchange] && exchangeData[exchange].exchange_name) {
                    if (exchange === exchangeData[exchange].exchange_name.toLowerCase()) {
                        // Confirm before deleting
                        const confirmEdit = confirm(`Are you sure you want to edit the current ${exchangeData[exchange].exchange_name} API?`);
                        if (!confirmEdit) return;
                    }
                }
            }

            const postResponse = await fetch('http://localhost:5000/trader/exchange', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    exchange,
                    accountName,
                    apiKey,
                    apiSecret
                })
            });

            const data = await postResponse.json();
            if (!postResponse.ok) {
                throw new Error(data.error || 'Failed to save API credentials');
            }
        
            updateExchanges();
        }
        catch(error) {
            console.error('Error:', error);
            exchangeMessageContainer.textContent = error.message;
            exchangeMessageContainer.style.color = 'red';
            exchangeMessageContainer.style.display = 'block';
        }
    });

    // Edit API button
    window.editExchange = async function(exchange) {
        document.getElementById('add-exchange-container').classList.remove('active');
        document.getElementById('new-exchange-container').classList.add('active');
    
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return null;
        }

        try {
            const response = await fetch(`http://localhost:5000/trader/exchange?exchange=${exchange}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Failed to fetch exchange data:', response.statusText);
                return;
            }

            const exchangeData = await response.json();
            //console.log('Exchange Data:', exchangeData);
        
            if (exchangeData) {
                // Pre-fill the form with the current data
                document.getElementById('new-exchange').value = exchange;
                document.getElementById('new-exchange-account-name').value = exchangeData[exchange].account_name;
                document.getElementById('new-exchange-api-key').value = exchangeData[exchange].api_key;
                document.getElementById('new-exchange-api-secret').value = exchangeData[exchange].api_secret;
            }
        } catch (error) {
            console.error('Error fetching exchange data:', error);
        }
    }

    // Delete API button
    window.deleteExchange = async function(exchange) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return;
        }

        // Confirm before deleting
        const confirmDelete = confirm(`Are you sure you want to delete the ${exchange.charAt(0).toUpperCase() + exchange.slice(1)} API?`);
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/trader/exchange`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ exchange })
            });

            if (!response.ok) {
                console.error('Failed to delete exchange data:', response.statusText);
                return;
            }

            console.log(`${exchange} API key deleted successfully!`);
            
            // Remove the deleted exchange row from the table
            const tableBody = document.getElementById("exchanges-tbody");
            const rows = tableBody.getElementsByTagName("tr");

            for (let i = 0; i < rows.length; i++) {
                const rowExchange = rows[i].children[0].textContent.trim().toLowerCase();
                if (rowExchange === exchange.toLowerCase()) {
                    tableBody.removeChild(rows[i]);
                    break;
                }
            }

            // Hide table if no data is left
            if (tableBody.children.length === 0) {
                tableBody.classList.remove("has-data");
            }
            
            updateExchanges();

        } catch (error) {
            console.error('Error deleting exchange data:', error);
        }
    }
});