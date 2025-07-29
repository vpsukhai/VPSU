// Main JavaScript for Veena Public School Website

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle functionality
    const mobileMenuToggle = document.createElement('div');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '<span></span><span></span><span></span>';
    document.querySelector('.header .container').prepend(mobileMenuToggle);
    
    const mainNav = document.querySelector('.main-nav');
    
    mobileMenuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        mainNav.classList.toggle('active');
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Current year in footer
    const yearSpan = document.createElement('span');
    yearSpan.textContent = new Date().getFullYear();
    document.querySelector('.footer-bottom p').innerHTML = 
        document.querySelector('.footer-bottom p').innerHTML.replace('2023', yearSpan.textContent);
    
    // Active link highlighting
    const currentPage = location.pathname.split('/').pop().replace('.html', '');
    if (currentPage) {
        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').replace('.html', '');
            if (linkPage === currentPage || (currentPage === 'index' && linkPage === '')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
});