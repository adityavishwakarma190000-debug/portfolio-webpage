/* ============================================== */
/*  SCROLL-DRIVEN 3D OBJECT ANIMATION             */
/*  One persistent object travelling through       */
/*  the entire portfolio as user scrolls           */
/* ============================================== */

(function () {
    'use strict';

    // ====== DOM ======
    const scrollObj = document.getElementById('scroll-3d-object');
    if (!scrollObj) return;

    const geoShape = scrollObj.querySelector('.geo-shape');
    const objectGlow = scrollObj.querySelector('.object-glow');

    // ====== REDUCED MOTION CHECK ======
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        scrollObj.style.display = 'none';
        return;
    }

    // ====== DEVICE DETECTION ======
    const isMobile = () => window.innerWidth <= 768;
    const isTablet = () => window.innerWidth > 768 && window.innerWidth <= 1024;

    // ====== SECTION REFERENCES ======
    const sections = ['hero', 'about', 'services', 'projects', 'contact'];
    const sectionEls = {};
    sections.forEach(id => {
        sectionEls[id] = document.getElementById(id);
    });

    // ============================================== 
    // SECTION KEYFRAMES — Define position/rotation 
    // for each section.
    //
    // To adjust the object's path later, simply
    // change these values.
    //
    // x, y: viewport percentage (0-100)
    // rotX, rotY, rotZ: degrees
    // scale: multiplier
    // glowIntensity: 0-1
    // glowColor: CSS color string
    // ============================================== 
    function getKeyframes() {
        if (isMobile()) {
            return {
                hero:     { x: 80, y: 15, rotX: 0,   rotY: 0,   rotZ: 0,   scale: 0.6, glowIntensity: 0.6, glowColor: '0, 240, 255' },
                about:    { x: 85, y: 20, rotX: 45,  rotY: 90,  rotZ: 15,  scale: 0.5, glowIntensity: 0.4, glowColor: '176, 38, 255' },
                services: { x: 15, y: 15, rotX: 90,  rotY: 180, rotZ: 30,  scale: 0.45, glowIntensity: 0.3, glowColor: '255, 0, 229' },
                projects: { x: 85, y: 80, rotX: 135, rotY: 270, rotZ: 45,  scale: 0.4, glowIntensity: 0.3, glowColor: '57, 255, 20' },
                contact:  { x: 50, y: 20, rotX: 180, rotY: 360, rotZ: 60,  scale: 0.5, glowIntensity: 0.5, glowColor: '0, 240, 255' },
            };
        }

        if (isTablet()) {
            return {
                hero:     { x: 75, y: 40, rotX: 0,   rotY: 0,   rotZ: 0,   scale: 0.8, glowIntensity: 0.7, glowColor: '0, 240, 255' },
                about:    { x: 85, y: 25, rotX: 30,  rotY: 90,  rotZ: 10,  scale: 0.7, glowIntensity: 0.5, glowColor: '176, 38, 255' },
                services: { x: 10, y: 35, rotX: 60,  rotY: 180, rotZ: 20,  scale: 0.65, glowIntensity: 0.4, glowColor: '255, 0, 229' },
                projects: { x: 88, y: 70, rotX: 100, rotY: 270, rotZ: 35,  scale: 0.6, glowIntensity: 0.4, glowColor: '57, 255, 20' },
                contact:  { x: 50, y: 30, rotX: 140, rotY: 360, rotZ: 45,  scale: 0.7, glowIntensity: 0.6, glowColor: '0, 240, 255' },
            };
        }

        // Desktop keyframes
        return {
            hero:     { x: 75, y: 45, rotX: 0,   rotY: 0,   rotZ: 0,   scale: 1.0, glowIntensity: 0.8, glowColor: '0, 240, 255' },
            about:    { x: 88, y: 30, rotX: 35,  rotY: 90,  rotZ: 10,  scale: 0.85, glowIntensity: 0.5, glowColor: '176, 38, 255' },
            services: { x: 8,  y: 40, rotX: 70,  rotY: 180, rotZ: 20,  scale: 0.75, glowIntensity: 0.4, glowColor: '255, 0, 229' },
            projects: { x: 90, y: 65, rotX: 110, rotY: 270, rotZ: 35,  scale: 0.7, glowIntensity: 0.4, glowColor: '57, 255, 20' },
            contact:  { x: 50, y: 35, rotX: 150, rotY: 360, rotZ: 50,  scale: 0.9, glowIntensity: 0.7, glowColor: '0, 240, 255' },
        };
    }

    // ====== INTERPOLATION STATE ======
    const current = { x: 75, y: 45, rotX: 0, rotY: 0, rotZ: 0, scale: 1, glowIntensity: 0.8 };
    let target = { ...current };
    let currentGlowColor = '0, 240, 255';

    // Lerp factor — controls smoothness (lower = smoother but slower)
    const LERP_FACTOR = 0.06;
    const LERP_FACTOR_MOBILE = 0.08;

    // ====== IDLE ANIMATION (before scrolling) ======
    let idlePhase = 0;
    const IDLE_AMPLITUDE = 8; // pixels of float
    const IDLE_SPEED = 0.015;
    let hasScrolled = false;

    // ====== SCROLL STATE ======
    let scrollY = 0;
    let ticking = false;

    // ====== HELPER: Get scroll progress between two sections ======
    function getSectionProgress(sectionId) {
        const el = sectionEls[sectionId];
        if (!el) return 0;

        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;

        // Returns 0 when section enters viewport, 1 when it leaves
        const progress = 1 - (rect.bottom / (vh + rect.height));
        return Math.max(0, Math.min(1, progress));
    }

    // ====== HELPER: Determine current section and interpolation ======
    function getScrollState() {
        const progresses = {};
        sections.forEach(id => {
            progresses[id] = getSectionProgress(id);
        });

        // Find which two sections we're transitioning between
        let fromSection = 'hero';
        let toSection = 'hero';
        let t = 0;

        for (let i = 0; i < sections.length - 1; i++) {
            const curr = sections[i];
            const next = sections[i + 1];
            const currProgress = progresses[curr];

            if (currProgress >= 0 && currProgress < 1) {
                fromSection = curr;
                toSection = next;
                // Smooth ease for the transition
                t = easeInOutCubic(currProgress);
                break;
            } else if (currProgress >= 1) {
                fromSection = next;
                toSection = next;
                t = 0;
            }
        }

        // Handle case where we're past the last section
        if (progresses[sections[sections.length - 1]] >= 1) {
            fromSection = sections[sections.length - 1];
            toSection = fromSection;
            t = 0;
        }

        return { fromSection, toSection, t, progresses };
    }

    // ====== EASING FUNCTIONS ======
    function easeInOutCubic(x) {
        return x < 0.5
            ? 4 * x * x * x
            : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    // ====== LERP ======
    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // ====== UPDATE TARGET BASED ON SCROLL ======
    function updateTarget() {
        const keyframes = getKeyframes();
        const { fromSection, toSection, t } = getScrollState();

        const from = keyframes[fromSection];
        const to = keyframes[toSection];

        if (!from || !to) return;

        target.x = lerp(from.x, to.x, t);
        target.y = lerp(from.y, to.y, t);
        target.rotX = lerp(from.rotX, to.rotX, t);
        target.rotY = lerp(from.rotY, to.rotY, t);
        target.rotZ = lerp(from.rotZ, to.rotZ, t);
        target.scale = lerp(from.scale, to.scale, t);
        target.glowIntensity = lerp(from.glowIntensity, to.glowIntensity, t);

        // Color transition
        if (t < 0.5) {
            currentGlowColor = from.glowColor;
        } else {
            currentGlowColor = to.glowColor;
        }
    }

    // ====== RENDER LOOP ======
    function render() {
        const lerpF = isMobile() ? LERP_FACTOR_MOBILE : LERP_FACTOR;

        // Interpolate current toward target
        current.x = lerp(current.x, target.x, lerpF);
        current.y = lerp(current.y, target.y, lerpF);
        current.rotX = lerp(current.rotX, target.rotX, lerpF);
        current.rotY = lerp(current.rotY, target.rotY, lerpF);
        current.rotZ = lerp(current.rotZ, target.rotZ, lerpF);
        current.scale = lerp(current.scale, target.scale, lerpF);
        current.glowIntensity = lerp(current.glowIntensity, target.glowIntensity, lerpF);

        // Idle floating animation when at top
        let idleOffsetY = 0;
        if (!hasScrolled || scrollY < 50) {
            idlePhase += IDLE_SPEED;
            idleOffsetY = Math.sin(idlePhase) * IDLE_AMPLITUDE;
        }

        // Calculate viewport positions
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const posX = (current.x / 100) * vw;
        const posY = (current.y / 100) * vh + idleOffsetY;

        // Apply transforms — GPU-friendly with transform only
        scrollObj.style.transform = `translate3d(${posX}px, ${posY}px, 0) scale(${current.scale})`;

        // Rotate the inner geometric shape
        if (geoShape) {
            geoShape.style.transform = `translate(-50%, -50%) rotateX(${current.rotX}deg) rotateY(${current.rotY}deg) rotateZ(${current.rotZ}deg)`;
        }

        // Update glow
        if (objectGlow) {
            objectGlow.style.background = `radial-gradient(circle,
                rgba(${currentGlowColor}, ${current.glowIntensity * 0.2}) 0%,
                rgba(${currentGlowColor}, ${current.glowIntensity * 0.08}) 40%,
                transparent 70%
            )`;
        }

        // Update cube face colors based on current glow
        const faces = scrollObj.querySelectorAll('.cube-face');
        faces.forEach(face => {
            face.style.borderColor = `rgba(${currentGlowColor}, 0.35)`;
            face.style.background = `rgba(${currentGlowColor}, 0.03)`;
        });

        requestAnimationFrame(render);
    }

    // ====== SCROLL EVENT ======
    function onScroll() {
        scrollY = window.scrollY || window.pageYOffset;
        hasScrolled = scrollY > 10;

        if (!ticking) {
            ticking = true;
            requestAnimationFrame(function () {
                updateTarget();
                ticking = false;
            });
        }
    }

    // ====== INIT ======
    function init() {
        // Set initial position
        const keyframes = getKeyframes();
        const heroKf = keyframes.hero;
        current.x = heroKf.x;
        current.y = heroKf.y;
        current.rotX = heroKf.rotX;
        current.rotY = heroKf.rotY;
        current.rotZ = heroKf.rotZ;
        current.scale = heroKf.scale;
        current.glowIntensity = heroKf.glowIntensity;
        target = { ...current };
        currentGlowColor = heroKf.glowColor;

        // Bind scroll
        window.addEventListener('scroll', onScroll, { passive: true });

        // Handle resize — update keyframes
        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                updateTarget();
            }, 200);
        });

        // Initial target calculation
        updateTarget();

        // Start render loop
        requestAnimationFrame(render);
    }

    // Start
    init();

    // ====== PUBLIC API for future adjustments ======
    // You can access this from the console to tweak values
    window.__scroll3D = {
        getKeyframes: getKeyframes,
        getCurrentState: () => ({ ...current }),
        getTarget: () => ({ ...target }),
        setLerp: (val) => { /* Can be extended */ },
    };
})();
