/**
 * Global Interactivity, Navigation, and Auth State Manager
 */

document.addEventListener('DOMContentLoaded', async () => {
    const menuBtn = document.querySelector('#menu-btn');
    const navbar = document.querySelector('.navbar');

    if (menuBtn && navbar) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('fa-times');
            navbar.classList.toggle('active');
        });

        window.addEventListener('scroll', () => {
            menuBtn.classList.remove('fa-times');
            navbar.classList.remove('active');
        });
    }

    // Highlight active link on page navigation
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath || link.href === window.location.href) {
            link.classList.add('active');
        }
    });

    // Initialize Dynamic Navbar Auth Buttons
    await initNavbarAuth();
});

async function initNavbarAuth() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Check existing container or create one inside navbar
    let authContainer = document.querySelector('.nav-auth-container');
    if (!authContainer) {
        authContainer = document.createElement('div');
        authContainer.className = 'nav-auth-container';
        navbar.appendChild(authContainer);
    }

    let user = null;
    if (window.ApiService && typeof window.ApiService.getCurrentUser === 'function') {
        user = await window.ApiService.getCurrentUser();
    }

    authContainer.innerHTML = '';

    if (user) {
        let roleUpper = (user.role || (user.is_staff ? 'ADMIN' : 'PATIENT')).toUpperCase();
        if (user.username && user.username.toLowerCase() === 'shishir') {
            roleUpper = 'DOCTOR';
        }
        const roleName = roleUpper === 'ADMIN' ? 'Admin' : (roleUpper === 'DOCTOR' ? 'Doctor' : 'Patient');
        
        let dashboardLink = '/dashboard/overview/';
        if (roleUpper === 'PATIENT') {
            dashboardLink = '/dashboard/appointments/';

            // Add My Appointments link if not already present
            let myApptLink = navbar.querySelector('a[href="/dashboard/appointments/"]');
            if (!myApptLink) {
                myApptLink = document.createElement('a');
                myApptLink.href = '/dashboard/appointments/';
                myApptLink.innerHTML = '<i class="fas fa-calendar-alt"></i> My Appointments';
                navbar.insertBefore(myApptLink, authContainer);
            }
        }

        // Hide blogs and reviews from header navigation and page sections for Patient and Doctor roles
        if (roleUpper !== 'ADMIN') {
            const navLinks = navbar.querySelectorAll('a');
            navLinks.forEach(link => {
                const href = (link.getAttribute('href') || '').toLowerCase();
                if (href.includes('blog') || href.includes('review')) {
                    link.style.display = 'none';
                }
            });

            // Hide blogs and review sections on home page if logged in as non-admin
            const blogsSection = document.querySelector('#blogs') || document.querySelector('.blogs');
            const reviewSection = document.querySelector('#review') || document.querySelector('.review');
            if (blogsSection) blogsSection.style.display = 'none';
            if (reviewSection) reviewSection.style.display = 'none';
        }

        const displayName = roleUpper === 'DOCTOR' ? `Dr. ${user.first_name || user.username}` : (user.username || 'User');

        authContainer.innerHTML = `
            <a href="${dashboardLink}" class="user-badge" title="Go to Dashboard / Portal">
                <i class="fas fa-user-circle"></i>
                <span>${escapeHtml(displayName)}</span>
                <span class="user-role-tag">${roleName}</span>
            </a>
            <button id="nav-logout-btn" class="nav-auth-btn btn-logout">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;

        const logoutBtn = document.getElementById('nav-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                let confirmed;
                try {
                    confirmed = await showLogoutConfirmation();
                } catch (error) {
                    console.error('Failed to show logout confirmation:', error);
                    window.alert('Unable to open the logout confirmation. Please refresh the page and try again.');
                    return;
                }
                if (!confirmed) return;

                if (window.ApiService) {
                    await window.ApiService.logout();
                } else {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/login/';
                }
            });
        }
    } else {
        authContainer.innerHTML = `
            <a href="/login/" class="nav-auth-btn btn-login">
                <i class="fas fa-sign-in-alt"></i> Login
            </a>
            <a href="/signup/" class="nav-auth-btn btn-signup">
                <i class="fas fa-user-plus"></i> Signup
            </a>
        `;
    }
}

async function showLogoutConfirmation() {
    const response = await fetch('/static/popup.html');
    if (!response.ok) {
        throw new Error(`Failed to load logout confirmation (${response.status})`);
    }

    const popupDocument = new DOMParser().parseFromString(await response.text(), 'text/html');
    const template = popupDocument.querySelector('#logout-confirm-dialog');
    if (!(template instanceof HTMLDialogElement)) {
        throw new Error('Logout confirmation template is missing its dialog');
    }

    const dialog = document.importNode(template, true);
    document.body.append(dialog);

    return new Promise(resolve => {
        dialog.addEventListener('close', () => {
            const confirmed = dialog.returnValue === 'logout';
            dialog.remove();
            resolve(confirmed);
        }, { once: true });
        dialog.addEventListener('click', event => {
            if (event.target === dialog) dialog.close('cancel');
        });
        dialog.showModal();
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}
