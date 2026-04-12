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
