/**
 * Global Interactivity and Navigation Manager
 */

document.addEventListener('DOMContentLoaded', () => {
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
});
