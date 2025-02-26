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
    const userIconImg = document.getElementById('user-icon-img');
    const logout = document.getElementById('logout');

    fetchTraderUsername();

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
            fetchProfileInfo();
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
    userIconImg.addEventListener('click', toggleDropdownMenu);

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
        if (!dropdownToggle.contains(event.target) && !userIconImg.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

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

    async function fetchProfileInfo() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return;
        }

        const response = await fetch('http://localhost:5000/trader/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const profileData = await response.json();
            //console.log('Profile:', profileData);

            // Update profile information
            document.querySelector('.profile-name').textContent = profileData.name;
            document.querySelector('.profile-email').textContent = profileData.email;
            document.querySelector('.profile-registration').textContent = new Date(profileData.register_date).toLocaleString('default', { month: 'long', year: 'numeric' });
        } else {
            console.log('Failed to fetch profile information');
        }
    }
});