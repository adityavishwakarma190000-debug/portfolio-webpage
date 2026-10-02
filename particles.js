/* ============================================== */
/*  PARTICLE SYSTEM — Floating tech particles     */
/*  Creates ambient depth with subtle dots/lines  */
/* ============================================== */

(function () {
    'use strict';

    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        canvas.style.display = 'none';
        return;
    }

    // Configuration
    const CONFIG = {
        particleCount: 60,
        maxConnectionDist: 120,
        particleMinSize: 0.5,
        particleMaxSize: 2,
        speedMultiplier: 0.15,
        connectionOpacity: 0.06,
        colors: [
            'rgba(255, 0, 51, ',   // cyan
            'rgba(255, 0, 229, ',   // magenta
            'rgba(57, 255, 20, ',   // green
            'rgba(176, 38, 255, ',  // purple
        ],
    };

    let particles = [];
    let animFrameId = null;
    let isVisible = true;

    // Resize handling
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = CONFIG.particleMinSize + Math.random() * (CONFIG.particleMaxSize - CONFIG.particleMinSize);
            this.speedX = (Math.random() - 0.5) * CONFIG.speedMultiplier;
            this.speedY = (Math.random() - 0.5) * CONFIG.speedMultiplier;
            this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
            this.opacity = 0.1 + Math.random() * 0.4;
            this.pulseSpeed = 0.005 + Math.random() * 0.01;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }

        update(time) {
            this.x += this.speedX;
            this.y += this.speedY;

            // Wrap around edges
            if (this.x < -10) this.x = canvas.width + 10;
            if (this.x > canvas.width + 10) this.x = -10;
            if (this.y < -10) this.y = canvas.height + 10;
            if (this.y > canvas.height + 10) this.y = -10;

            // Pulse opacity
            this.currentOpacity = this.opacity * (0.6 + 0.4 * Math.sin(time * this.pulseSpeed + this.pulsePhase));
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.currentOpacity + ')';
            ctx.fill();

            // Subtle glow
            if (this.size > 1.2) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = this.color + (this.currentOpacity * 0.1) + ')';
                ctx.fill();
            }
        }
    }

    function init() {
        resize();
        particles = [];

        // Adjust count for mobile
        const count = window.innerWidth < 768 ? Math.floor(CONFIG.particleCount * 0.4) : CONFIG.particleCount;

        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.maxConnectionDist) {
                    const opacity = CONFIG.connectionOpacity * (1 - dist / CONFIG.maxConnectionDist);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 0, 51, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate(time) {
        if (!isVisible) {
            animFrameId = requestAnimationFrame(animate);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const particle of particles) {
            particle.update(time);
            particle.draw();
        }

        drawConnections();

        animFrameId = requestAnimationFrame(animate);
    }

    // Visibility API — pause when tab hidden
    document.addEventListener('visibilitychange', function () {
        isVisible = !document.hidden;
    });

    // Debounced resize
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resize();
            // Re-init particles if count changes significantly
            const isMobile = window.innerWidth < 768;
            const targetCount = isMobile ? Math.floor(CONFIG.particleCount * 0.4) : CONFIG.particleCount;
            if (Math.abs(particles.length - targetCount) > 10) {
                init();
            }
        }, 250);
    });

    // Start
    init();
    animFrameId = requestAnimationFrame(animate);
})();
