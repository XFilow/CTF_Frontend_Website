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

    fetchTraderUsername();

    async function fetchTraderUsername() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return;
        }
    
        const response = await fetch('http://localhost:5000/trader/username', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    
        if (response.ok) {
            const userInfo = await response.json();   
            const displayName = userInfo.username || userInfo.email;
            dropdownToggle.textContent = displayName;
            console.log('Display Name:', displayName);
        } else {
            console.log('Not authenticated');
        }
    }

    function updateHeaderAndContent(event, contentId) {
        event.preventDefault();

        const selectedText = event.target.textContent;
        headerTitle.textContent = selectedText;

        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        document.getElementById(contentId).style.display = 'block';
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

    dropdownToggle.addEventListener('click', function() {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    dropdownMenu.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', function(event) {
            const contentId = event.currentTarget.getAttribute('data-content');

            if (contentId === 'logout-section') {
                localStorage.removeItem('token');
                console.log('Logged out');
                window.location.href = 'login?message=logout';
            } else {
                updateHeaderAndContent(event, contentId);
            }

            dropdownMenu.style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });
});