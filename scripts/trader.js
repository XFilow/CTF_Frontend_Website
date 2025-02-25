document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mainContent = document.getElementById('.main-content');
    const sidebar = document.querySelector('.sidebar');
    const headerTitle = document.querySelector('.content-header h2'); // Corrected to select <h2>
    const menuTexts = document.querySelectorAll('.sidebar-menu a span');
    const sidebarTitle = document.querySelector('.sidebar-title');
    const navLinks = document.querySelectorAll('.sidebar-menu ul li a');

    fetchTraderInfo();

    // Check JWT Token
    async function fetchTraderInfo() {
        const token = localStorage.getItem('token');  // Get token
    
        if (!token) {
            console.log('User is not logged in');
            return;
        }
    
        const response = await fetch('http://localhost:5000/trader/info', {
            headers: { 'Authorization': `Bearer ${token}` }  // Attach token
        });
    
        if (response.ok) {
            const traderInfo = await response.json();
            console.log('Trader Info:', traderInfo);
        } else {
            console.log('Not authenticated');
        }
    }

    // Function to update the header title and main content based on the clicked link
    function updateHeaderAndContent(event) {
        event.preventDefault(); // Prevent the default navigation behavior

        // Get the text content of the clicked link
        const selectedText = event.currentTarget.querySelector('span').textContent;
        headerTitle.textContent = selectedText; // Update the header title

        // Get the data-content attribute to determine which section to display
        const contentId = event.currentTarget.getAttribute('data-content');

        // Hide all content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show the selected content section
        document.getElementById(contentId).style.display = 'block';
    }

    // Add click event listeners to all navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', updateHeaderAndContent);
    });

    // Toggle sidebar width and visibility of text elements
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('expanded');
        mainContent.classList.toggle('expanded');
        document.body.classList.toggle('icons-only');

        // Toggle visibility of sidebar title and menu texts
        sidebarTitle.style.display = sidebarTitle.style.display === 'none' ? 'block' : 'none';
        menuTexts.forEach(text => {
            text.style.display = text.style.display === 'none' ? 'inline' : 'none';
        });
    });

    function logout() {
        localStorage.removeItem('token');  // Delete JWT token
        console.log('Logged out');
    }
});