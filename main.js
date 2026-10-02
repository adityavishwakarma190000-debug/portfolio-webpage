/* ============================================== */
/*  MAIN.JS — Portfolio interactions & animations  */
/* ============================================== */

(function () {
    'use strict';

    // ====== CUSTOM CURSOR ======
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');

    if (cursorDot && cursorRing && window.innerWidth > 768) {
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });

        function animateRing() {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Hover state for interactive elements
        const hoverTargets = document.querySelectorAll('a, button, .service-card, .project-card, .tech-item, .contact-link-item');
        hoverTargets.forEach(function (el) {
            el.addEventListener('mouseenter', function () {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', function () {
                document.body.classList.remove('cursor-hover');
            });
        });
    }

    // ====== NAVIGATION ======
    const nav = document.getElementById('main-nav');
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    // Nav scroll effect
    let lastScrollY = 0;
    function handleNavScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScrollY = scrollY;
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });

    // Mobile toggle
    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function () {
            navToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close on mobile link click
        mobileLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                navToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ====== ACTIVE NAV LINK TRACKING ======
    const sections = document.querySelectorAll('.section');

    function updateActiveLink() {
        let current = 'hero';
        sections.forEach(function (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.4) {
                current = section.id;
            }
        });

        navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.dataset.section === current) {
                link.classList.add('active');
            }
        });

        mobileLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.dataset.section === current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });

    // ====== SCROLL PROGRESS BAR ======
    const progressFill = document.getElementById('progress-fill');
    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        if (progressFill) {
            progressFill.style.width = Math.min(progress, 100) + '%';
        }
    }

    window.addEventListener('scroll', updateProgress, { passive: true });

    // ====== SCROLL REVEAL ANIMATIONS ======
    function initScrollReveal() {
        // Add reveal classes to elements
        const revealElements = document.querySelectorAll(
            '.section-header, .about-intro, .about-detail, .about-tech-stack, ' +
            '.about-image-placeholder, .service-card, .project-card, ' +
            '.contact-intro, .contact-link-item, .contact-3d-space'
        );

        revealElements.forEach(function (el, index) {
            el.classList.add('reveal');
            // Stagger within groups
            const card = el.closest('.services-grid, .projects-grid, .contact-links');
            if (card) {
                const siblings = card.children;
                const childIndex = Array.from(siblings).indexOf(el);
                el.classList.add('reveal-delay-' + Math.min(childIndex + 1, 4));
            }
        });

        // Intersection Observer
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px'
        };

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Don't unobserve — allows re-animation on scroll back if desired
                }
            });
        }, observerOptions);

        revealElements.forEach(function (el) {
            observer.observe(el);
        });
    }

    initScrollReveal();

    // ====== STAT COUNTER ANIMATION ======
    function animateCounters() {
        const statNumbers = document.querySelectorAll('.stat-number[data-count]');

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const targetCount = parseInt(el.dataset.count, 10);
                    const duration = 2000;
                    const startTime = performance.now();

                    function updateCounter(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out cubic
                        const easedProgress = 1 - Math.pow(1 - progress, 3);
                        const currentValue = Math.round(easedProgress * targetCount);
                        el.textContent = currentValue;

                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        }
                    }

                    requestAnimationFrame(updateCounter);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(function (el) {
            observer.observe(el);
        });
    }

    animateCounters();

    // ====== SMOOTH SCROLL FOR NAV LINKS ======
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').slice(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                const offsetTop = targetEl.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ====== HIDE SCROLL INDICATOR ON SCROLL ======
    const scrollIndicator = document.getElementById('scroll-indicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 100) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.pointerEvents = 'auto';
            }
        }, { passive: true });
    }

    // ====== GRID BACKGROUND EFFECT ======
    // Subtle animated grid overlay for tech feel
    function createGridOverlay() {
        const gridCanvas = document.createElement('canvas');
        gridCanvas.id = 'grid-canvas';
        gridCanvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 2;
            pointer-events: none;
            opacity: 0.03;
        `;
        document.body.insertBefore(gridCanvas, document.body.firstChild);

        const ctx = gridCanvas.getContext('2d');

        function drawGrid() {
            gridCanvas.width = window.innerWidth;
            gridCanvas.height = window.innerHeight;

            const gridSize = 60;
            ctx.strokeStyle = 'rgba(0, 240, 255, 1)';
            ctx.lineWidth = 0.5;

            // Vertical lines
            for (let x = 0; x <= gridCanvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, gridCanvas.height);
                ctx.stroke();
            }

            // Horizontal lines
            for (let y = 0; y <= gridCanvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(gridCanvas.width, y);
                ctx.stroke();
            }
        }

        drawGrid();

        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(drawGrid, 200);
        });
    }

    // Only add grid on desktop
    if (window.innerWidth > 768) {
        createGridOverlay();
    }

    // ====== MAGNETIC BUTTON EFFECT ======
    const magneticBtns = document.querySelectorAll('.btn');
    if (window.innerWidth > 768) {
        magneticBtns.forEach(function (btn) {
            btn.addEventListener('mousemove', function (e) {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });

            btn.addEventListener('mouseleave', function () {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    // ====== TYPING EFFECT FOR SECTION TAGS ======
    function animateSectionTags() {
        const tags = document.querySelectorAll('.section-tag');
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const text = el.textContent;
                    el.textContent = '';
                    el.style.opacity = '0.5';

                    let i = 0;
                    function type() {
                        if (i < text.length) {
                            el.textContent += text[i];
                            i++;
                            setTimeout(type, 40);
                        }
                    }
                    type();
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        tags.forEach(function (tag) {
            observer.observe(tag);
        });
    }

    animateSectionTags();

    // ====== SERVICE CARD TILT EFFECT ======
    if (window.innerWidth > 768) {
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                const rotateX = (y - 0.5) * -8;
                const rotateY = (x - 0.5) * 8;
                card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', function () {
                card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            });
        });
    }

    // ====== PARALLAX SUBTLE EFFECT FOR SECTION CONTENT ======
    if (window.innerWidth > 768) {
        window.addEventListener('scroll', function () {
            const scrolled = window.scrollY;
            const sectionHeaders = document.querySelectorAll('.section-header');
            sectionHeaders.forEach(function (header) {
                const rect = header.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const speed = 0.03;
                    const yPos = -(rect.top * speed);
                    header.style.transform = `translateY(${yPos}px)`;
                }
            });
        }, { passive: true });
    }

    // ====== CONSOLE EASTER EGG ======
    console.log(
        '%c⚡ Portfolio Website ⚡\n%cCrafted with precision.',
        'color: #00f0ff; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #00f0ff;',
        'color: #a0a0b5; font-size: 12px;'
    );

})();
