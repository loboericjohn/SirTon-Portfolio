document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // --- Custom Mouse Follower ---
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    const follower = document.createElement('div');
    follower.className = 'cursor-follower';
    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        follower.style.transform = `translate3d(${e.clientX - 15}px, ${e.clientY - 15}px, 0)`;
    });

    // --- Theme Toggle Logic ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
        lucide.createIcons();
    });

    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide scroll indicator on scroll
        if (window.scrollY > 50) {
            if (scrollIndicator) scrollIndicator.classList.add('hidden');
        } else {
            if (scrollIndicator) scrollIndicator.classList.remove('hidden');
        }
    });

    // --- 3D Tilt Effect for Hero Image ---
    const heroFrame = document.querySelector('.hero-image-frame');
    const heroImg = document.querySelector('.hero-img-main');

    if (heroFrame && heroImg) {
        heroFrame.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = heroFrame.getBoundingClientRect();
            const x = (e.clientX - left) / width - 0.5;
            const y = (e.clientY - top) / height - 0.5;
            
            heroImg.style.transform = `rotateY(${x * 20}deg) rotateX(${y * -20}deg) scale(1.05)`;
        });

        heroFrame.addEventListener('mouseleave', () => {
            heroImg.style.transform = `rotateY(0deg) rotateX(0deg) scale(1)`;
        });
    }

    // --- Side Menu Logic ---
    const burgerMenu = document.getElementById('burger-menu');
    const closeMenu = document.getElementById('close-menu');
    const sideNav = document.getElementById('side-nav');
    const navOverlay = document.getElementById('nav-overlay');
    const navLinksList = document.querySelectorAll('.nav-links a');

    const toggleMenu = () => {
        sideNav.classList.toggle('active');
        navOverlay.classList.toggle('active');
        body.classList.toggle('no-scroll');
    };

    if (burgerMenu) burgerMenu.addEventListener('click', toggleMenu);
    if (closeMenu) closeMenu.addEventListener('click', toggleMenu);
    if (navOverlay) navOverlay.addEventListener('click', toggleMenu);

    navLinksList.forEach(link => {
        link.addEventListener('click', () => {
            if (sideNav.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Contact Form ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            alert(`Thank you, ${formData.get('name')}! Your message has been sent.`);
            contactForm.reset();
        });
    }
});
