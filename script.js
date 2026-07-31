document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const audio = document.getElementById('bg-music');
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const envelope = document.getElementById('envelope');
    const introOverlay = document.getElementById('intro-overlay');
    const mainWrapper = document.getElementById('main-wrapper');
    const musicBtn = document.getElementById('music-btn');
    const musicIndicator = document.getElementById('music-indicator');

    // 1. Envelope opening and site entry
    let siteOpened = false;
    if (envelopeWrapper) {
        envelopeWrapper.addEventListener('click', () => {
            if (siteOpened) return;
            siteOpened = true;
            
            // Add open class to animate flap and letter
            envelope.classList.add('open');
            
            // Play audio as soon as interaction happens
            playAudio();

            // Transition from overlay to dashboard
            setTimeout(() => {
                introOverlay.classList.add('fade-out');
                mainWrapper.classList.add('show');
                
                // Trigger canvas resize
                resizeCanvas();
            }, 1800);
        });
    }

    // 2. Audio control
    function playAudio() {
        if (!audio) return;
        audio.play().then(() => {
            musicBtn.classList.add('playing');
            musicIndicator.textContent = "NOW PLAYING";
        }).catch(err => {
            console.log("Audio autoplay blocked or failed:", err);
            musicBtn.classList.remove('playing');
            musicIndicator.textContent = "PLAY MUSIC";
        });
    }

    function toggleAudio() {
        if (!audio) return;
        if (audio.paused) {
            audio.play();
            musicBtn.classList.add('playing');
            musicIndicator.textContent = "NOW PLAYING";
        } else {
            audio.pause();
            musicBtn.classList.remove('playing');
            musicIndicator.textContent = "MUTED";
        }
    }

    if (musicBtn) {
        musicBtn.addEventListener('click', toggleAudio);
    }

    // 3. Canvas particle system (Floating Hearts & Stars)
    const canvas = document.getElementById('canvas-particles');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let particles = [];
    const maxParticles = 60;

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.reset();
            this.y = Math.random() * canvas.height; // distribute vertically on start
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 20;
            this.size = Math.random() * 12 + 6;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = -(Math.random() * 1 + 0.5);
            this.opacity = Math.random() * 0.5 + 0.3;
            this.type = Math.random() > 0.4 ? 'heart' : 'star';
            this.color = this.type === 'heart' 
                ? `rgba(255, ${Math.floor(Math.random() * 100 + 50)}, ${Math.floor(Math.random() * 150 + 100)}, ${this.opacity})`
                : `rgba(255, 215, 0, ${this.opacity})`; // gold stars
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // wobble slightly
            this.speedX += Math.sin(this.y / 30) * 0.05;

            // Check if offscreen
            if (this.y < -30 || this.x < -30 || this.x > canvas.width + 30) {
                this.reset();
            }
        }

        draw() {
            if (!ctx) return;
            ctx.fillStyle = this.color;
            
            if (this.type === 'heart') {
                // Draw heart path
                ctx.beginPath();
                const x = this.x;
                const y = this.y;
                const size = this.size;
                ctx.moveTo(x, y + size / 4);
                ctx.quadraticCurveTo(x, y, x - size / 2, y);
                ctx.quadraticCurveTo(x - size, y, x - size, y + size / 2);
                ctx.quadraticCurveTo(x - size, y + size * 0.9, x, y + size * 1.4);
                ctx.quadraticCurveTo(x + size, y + size * 0.9, x + size, y + size / 2);
                ctx.quadraticCurveTo(x + size, y, x + size / 2, y);
                ctx.quadraticCurveTo(x, y, x, y + size / 4);
                ctx.closePath();
                ctx.fill();
            } else {
                // Draw glowing star
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size / 4, 0, Math.PI * 2);
                ctx.closePath();
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
                ctx.fill();
                ctx.shadowBlur = 0; // reset
            }
        }
    }

    function initParticles() {
        if (!canvas) return;
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();



    // 5. Mobile card flip support (tap to flip)
    const cardItems = document.querySelectorAll('.card-item');
    cardItems.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });

    // Scroll animation loader for glass-cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                cardObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.glass-card');
    scrollElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        cardObserver.observe(el);
    });
});
