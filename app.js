// 3D Portfolio App JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initCustomCursor();
    initTypingEffect();
    initTiltCards();
    initMobileNav();
    initContactForm();
});

/* =========================================================================
   1. Interactive 3D Background (Three.js)
   ========================================================================= */
function initThreeJS() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Sphere Geometry
    const particlesCount = 1800;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    const colorPurple = new THREE.Color('#a855f7');
    const colorCyan = new THREE.Color('#06b6d4');
    const colorPink = new THREE.Color('#ec4899');

    for (let i = 0; i < particlesCount; i++) {
        // Distribute particles in a sphere shape
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 2.0 + Math.random() * 1.5; // Radius with slight variance

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Interpolate colors based on position
        let mixColor;
        if (i % 3 === 0) {
            mixColor = colorPurple;
        } else if (i % 3 === 1) {
            mixColor = colorCyan;
        } else {
            mixColor = colorPink;
        }

        colors[i * 3] = mixColor.r;
        colors[i * 3 + 1] = mixColor.g;
        colors[i * 3 + 2] = mixColor.b;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Texture for smooth circle particles (Canvas generated texture)
    const pTexture = createCircleTexture();

    // Material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        alphaMap: pTexture,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.8
    });

    // Points
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // Dynamic lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xa855f7, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Mouse movement capture
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouseX = (e.touches[0].clientX / window.innerWidth) - 0.5;
            mouseY = (e.touches[0].clientY / window.innerHeight) - 0.5;
        }
    }, { passive: true });

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Helper to generate particle texture
    function createCircleTexture() {
        const cCanvas = document.createElement('canvas');
        cCanvas.width = 16;
        cCanvas.height = 16;
        const ctx = cCanvas.getContext('2d');
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
        return new THREE.CanvasTexture(cCanvas);
    }

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Slow rotation of particle sphere
        particleSystem.rotation.y = elapsedTime * 0.05;
        particleSystem.rotation.x = elapsedTime * 0.02;

        // Interactive mouse parallax (inertia)
        targetX = mouseX * 0.4;
        targetY = mouseY * 0.4;

        particleSystem.rotation.y += (targetX - particleSystem.rotation.y) * 0.1;
        particleSystem.rotation.x += (targetY - particleSystem.rotation.x) * 0.1;

        renderer.render(scene, camera);
    };

    animate();
}

/* =========================================================================
   2. Custom Trail Cursor
   ========================================================================= */
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const glow = document.querySelector('.custom-cursor-glow');
    if (!cursor || !glow) return;

    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
    });

    // Easing/lag effect for outer glow ring
    function updateGlowPosition() {
        posX += (mouseX - posX) * 0.12;
        posY += (mouseY - posY) * 0.12;

        glow.style.left = `${posX}px`;
        glow.style.top = `${posY}px`;

        requestAnimationFrame(updateGlowPosition);
    }
    updateGlowPosition();

    // Trigger cursor scales on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .tilt-card, .social-icon');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('hovering-link');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('hovering-link');
        });
    });
}

/* =========================================================================
   3. Typing Subtitle Loop
   ========================================================================= */
function initTypingEffect() {
    const typedTextSpan = document.getElementById('typed-text');
    if (!typedTextSpan) return;

    const roles = ['Cloud Engineer', 'DevOps Specialist', 'Automation Architect', 'Systems Developer'];
    const typingSpeed = 100;
    const erasingSpeed = 60;
    const newRoleDelay = 2000; // Delay between roles
    let roleIdx = 0;
    let charIdx = 0;

    function type() {
        if (charIdx < roles[roleIdx].length) {
            typedTextSpan.textContent += roles[roleIdx].charAt(charIdx);
            charIdx++;
            setTimeout(type, typingSpeed);
        } else {
            setTimeout(erase, newRoleDelay);
        }
    }

    function erase() {
        if (charIdx > 0) {
            typedTextSpan.textContent = roles[roleIdx].substring(0, charIdx - 1);
            charIdx--;
            setTimeout(erase, erasingSpeed);
        } else {
            roleIdx++;
            if (roleIdx >= roles.length) roleIdx = 0;
            setTimeout(type, typingSpeed + 500);
        }
    }

    // Start
    setTimeout(type, 1000);
}

/* =========================================================================
   4. 3D Card Hover Tilt Effects
   ========================================================================= */
function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 991) return; // Skip 3D tilt calculations on mobile
            const cardRect = card.getBoundingClientRect();
            
            // X & Y position relative to card boundaries
            const x = e.clientX - cardRect.left;
            const y = e.clientY - cardRect.top;
            
            // Normalize inputs (ranges from -0.5 to 0.5)
            const xc = cardRect.width / 2;
            const yc = cardRect.height / 2;
            const tiltX = (y - yc) / yc; // Range: -1 to 1
            const tiltY = (x - xc) / xc; // Range: -1 to 1

            // Max rotational angles (e.g. tilt up to 10 deg)
            const maxTilt = 12;

            // Update css transforms on target card
            card.style.transform = `
                perspective(1000px)
                rotateX(${-tiltX * maxTilt}deg)
                rotateY(${tiltY * maxTilt}deg)
                scale3d(1.03, 1.03, 1.03)
            `;

            // Adjust glow/lighting layer dynamically if it has one
            const glowEl = card.querySelector('.card-glow');
            if (glowEl) {
                const angle = Math.atan2(y - yc, x - xc) * (180 / Math.PI);
                glowEl.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 80%)`;
            }
        });

        // Reset positions smoothly on exit
        card.addEventListener('mouseleave', () => {
            card.style.transform = `
                perspective(1000px)
                rotateX(0deg)
                rotateY(0deg)
                scale3d(1, 1, 1)
            `;
            const glowEl = card.querySelector('.card-glow');
            if (glowEl) {
                glowEl.style.background = 'none';
            }
        });
    });
}

/* =========================================================================
   5. Mobile Responsive Nav Hamburger
   ========================================================================= */
function initMobileNav() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Scroll active link highlight
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').slice(1) === current) {
                item.classList.add('active');
            }
        });
    });
}

/* =========================================================================
   6. Contact Form submission logic
   ========================================================================= */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const origText = submitBtn.innerHTML;
        
        // Show sending state
        submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-circle-notch fa-spin"></i>';
        submitBtn.disabled = true;

        // Mock API callback
        setTimeout(() => {
            submitBtn.innerHTML = 'Success! <i class="fa-solid fa-circle-check"></i>';
            submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            form.reset();

            setTimeout(() => {
                submitBtn.innerHTML = origText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        }, 1500);
    });
}
