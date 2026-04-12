/**
 * Advertize.World Static Website Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Particle Canvas
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = 1.5;
        this.speedX = Math.random() * 0.2 - 0.1;
        this.speedY = Math.random() * 0.2 - 0.1;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = '#A37E2C';
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 60; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(163, 126, 44, ${0.08 - distance / 1800})`;
            ctx.lineWidth = 0.3;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
      requestAnimationFrame(animate);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    window.addEventListener('resize', resize);
    resize();
    animate();
  }

  // Navigation Scroll Listener
  const nav = document.getElementById('main-nav');
  const whyUsSection = document.getElementById('why-us');
  const footer = document.querySelector('footer');

  const updateNavColor = () => {
    if (!nav) return;
    let isDark = false;
    
    if (whyUsSection) {
      const rect = whyUsSection.getBoundingClientRect();
      if (rect.top <= 60 && rect.bottom >= 60) {
        isDark = true;
      }
    }
    
    if (footer) {
      const rect = footer.getBoundingClientRect();
      if (rect.top <= 60) {
        isDark = true;
      }
    }

    if (isDark) {
      nav.classList.add('text-pearl');
      nav.classList.remove('text-midnight-navy');
      nav.querySelectorAll('.logo-svg text[fill="#000C1D"]').forEach(t => t.setAttribute('fill', '#FDFCFB'));
      nav.querySelectorAll('.logo-svg path[stroke="#000C1D"]').forEach(p => p.setAttribute('stroke', '#FDFCFB'));
    } else {
      nav.classList.add('text-midnight-navy');
      nav.classList.remove('text-pearl');
      nav.querySelectorAll('.logo-svg text[fill="#FDFCFB"]').forEach(t => t.setAttribute('fill', '#000C1D'));
      nav.querySelectorAll('.logo-svg path[stroke="#FDFCFB"]').forEach(p => p.setAttribute('stroke', '#000C1D'));
    }
  };

  window.addEventListener('scroll', updateNavColor);
  updateNavColor();

  // Mobile Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const xIcon = document.getElementById('x-icon');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      const isActive = mobileMenu.classList.contains('active');
      menuIcon.style.display = isActive ? 'none' : 'block';
      xIcon.style.display = isActive ? 'block' : 'none';
      document.body.style.overflow = isActive ? 'hidden' : 'auto';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        menuIcon.style.display = 'block';
        xIcon.style.display = 'none';
        document.body.style.overflow = 'auto';
      });
    });
  }

  // Why Us Process Toggle
  const processBtn = document.getElementById('learn-process-btn');
  const processContent = document.getElementById('process-content');
  const chevron = document.getElementById('process-chevron');

  if (processBtn && processContent) {
    processBtn.addEventListener('click', () => {
      const isHidden = processContent.style.height === '0px' || processContent.style.height === '';
      processContent.style.height = isHidden ? 'auto' : '0px';
      processContent.style.opacity = isHidden ? '1' : '0';
      chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  }

  // Contact Form Submission
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const formError = document.getElementById('form-error');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        name: contactForm.name.value,
        email: contactForm.email.value,
        message: contactForm.message.value
      };

      submitBtn.disabled = true;
      submitBtn.innerText = 'Sending...';
      formError.style.display = 'none';

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          contactForm.style.display = 'none';
          formSuccess.style.display = 'block';
        } else {
          const data = await response.json();
          formError.innerText = data.error || 'Failed to send message.';
          formError.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.innerText = 'Start a Conversation';
        }
      } catch (error) {
        formError.innerText = 'An unexpected error occurred. Please try again.';
        formError.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerText = 'Start a Conversation';
      }
    });
  }

  // Reset Form
  window.resetForm = () => {
    contactForm.style.display = 'block';
    formSuccess.style.display = 'none';
    contactForm.reset();
    submitBtn.disabled = false;
    submitBtn.innerText = 'Start a Conversation';
  };
});

// ============================================================
// 3D ANIMATIONS — Three.js + GSAP ScrollTrigger
// Runs immediately (script is at bottom of body, DOM is ready)
// ============================================================

// Register ScrollTrigger once — must run before any ScrollTrigger usage
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ── 1. HERO GLOBE ────────────────────────────────────────────
(function initGlobe() {
  if (typeof THREE === 'undefined' || typeof gsap === 'undefined') return;
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  const W = canvas.offsetWidth  || window.innerWidth;
  const H = canvas.offsetHeight || window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 2000);
  camera.position.z = 600;

  // Navy wireframe sphere
  const wireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(180, 24, 16)),
    new THREE.LineBasicMaterial({ color: 0x000C1D, transparent: true, opacity: 0.12 })
  );
  scene.add(wireframe);

  // 3 gold meridian rings
  const goldMat = new THREE.LineBasicMaterial({ color: 0xA37E2C, transparent: true, opacity: 0.18 });
  [0, 60, 120].forEach(deg => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * 180, Math.sin(a) * 180, 0));
    }
    const meridian = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts), goldMat
    );
    meridian.rotation.y = THREE.MathUtils.degToRad(deg);
    scene.add(meridian);
  });

  // Equatorial gold particle ring
  const RING_COUNT = 120;
  const ringPos    = new Float32Array(RING_COUNT * 3);
  for (let i = 0; i < RING_COUNT; i++) {
    const a = (i / RING_COUNT) * Math.PI * 2;
    ringPos[i * 3]     = Math.cos(a) * 195;
    ringPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    ringPos[i * 3 + 2] = Math.sin(a) * 195;
  }
  const ringGeo = new THREE.BufferGeometry();
  ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
  const ring = new THREE.Points(ringGeo, new THREE.PointsMaterial({
    color: 0xA37E2C, size: 1.8, transparent: true, opacity: 0.35
  }));
  scene.add(ring);

  // Mouse parallax target values
  let mx = 0, my = 0;
  let autoRotY = 0, parallaxY = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 0.12;
    my = (e.clientY / window.innerHeight - 0.5) * 0.12;
  });

  // Render loop
  let globeRaf;
  const globeActive = { value: true };
  const globeTick = () => {
    if (!globeActive.value) return;
    globeRaf = requestAnimationFrame(globeTick);
    autoRotY  += 0.0008;
    parallaxY += (mx - parallaxY) * 0.05;
    wireframe.rotation.x += (my - wireframe.rotation.x) * 0.05;
    wireframe.rotation.y  = autoRotY + parallaxY;
    ring.rotation.y       = autoRotY;
    ring.rotation.x       = wireframe.rotation.x * 0.5;
    renderer.render(scene, camera);
  };
  globeTick();

  // Resize
  window.addEventListener('resize', () => {
    const W2 = canvas.offsetWidth  || window.innerWidth;
    const H2 = canvas.offsetHeight || window.innerHeight;
    renderer.setSize(W2, H2, false);
    camera.aspect = W2 / H2;
    camera.updateProjectionMatrix();
  });

  // Entrance animation (load)
  gsap.from(canvas, {
    duration: 1.4,
    opacity: 0,
    scale: 0.85,
    ease: 'power2.out',
    transformOrigin: 'center center'
  });

  // Scroll exit — fade out as hero scrolls away
  gsap.to(canvas, {
    opacity: 0,
    scrollTrigger: {
      trigger: 'header',
      start: 'center top',
      end: 'bottom top',
      scrub: 1
    }
  });

  // Stop RAF when off-screen, resume when back
  ScrollTrigger.create({
    trigger: 'header',
    start: 'top bottom',
    end: 'bottom top',
    onLeave:      () => { globeActive.value = false; cancelAnimationFrame(globeRaf); canvas.style.visibility = 'hidden'; },
    onEnterBack:  () => { globeActive.value = true; cancelAnimationFrame(globeRaf); canvas.style.visibility = 'visible'; globeTick(); }
  });
})();
