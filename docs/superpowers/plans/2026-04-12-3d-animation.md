# 3D Animation (Cinematic Globe) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Three.js globe hero, GSAP scroll-triggered 3D text reveals, service card tilt, floating diamond, and contact particle burst to Advertize.World — purely additive, zero color or layout changes.

**Architecture:** Three CDN scripts (Three.js r128, GSAP 3.12.2, ScrollTrigger) load before script.js. All new animation code is appended to script.js as a series of self-contained IIFEs. The existing IntersectionObserver `[data-animate]` system is removed and replaced entirely by GSAP ScrollTrigger. Three `<canvas>` elements are added to the HTML.

**Tech Stack:** Three.js r128 (CDN), GSAP 3.12.2 + ScrollTrigger plugin (CDN), vanilla JS, no build step changes.

---

## File Map

| File | What Changes |
|---|---|
| `index.html` | Add 3 CDN `<script>` tags before `script.js`; add `relative` class to `<header>`; insert `<canvas id="globe-canvas">` as first child of `<header>`; insert `<canvas id="diamond-canvas">` as first child of `#why-us`; add `relative overflow-hidden` to `#contact` section; insert `<canvas id="contact-canvas">` as first child of `#contact` |
| `style.css` | Remove the `[data-animate]` and `.visible` CSS rules (10 lines); append canvas positioning + nav blur rules |
| `script.js` | Remove IntersectionObserver block (lines 147–160); append `init3DAnimations` block after the last `});` — structured as 8 nested IIFEs |

---

### Task 1: Add CDN Scripts to index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add Three.js and GSAP CDN scripts before `script.js`**

Find this line near the very bottom of `<body>`:
```html
    <script src="script.js"></script>
```

Replace it with:
```html
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script src="script.js"></script>
```

- [ ] **Step 2: Verify libraries load**

Run the dev server:
```bash
npm run dev
```

Open `http://localhost:3000`. Open DevTools console. Run:
```javascript
console.log(typeof THREE, typeof gsap, typeof ScrollTrigger)
```
Expected output: `object object object`

If any is `undefined`, check the network tab — the CDN may be blocked or the URL wrong.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Three.js r128 and GSAP 3 CDN scripts"
```

---

### Task 2: Add Canvas Elements to index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add `relative` to the hero `<header>` and insert globe canvas**

Find:
```html
        <header class="h-screen flex flex-col justify-center items-center text-center px-6">
            <div data-animate>
```

Replace with:
```html
        <header class="relative h-screen flex flex-col justify-center items-center text-center px-6">
            <canvas id="globe-canvas"></canvas>
            <div data-animate>
```

- [ ] **Step 2: Insert diamond canvas into the Why-Us section**

Find:
```html
        <section id="why-us" class="bg-midnight-navy text-pearl py-40 px-6 overflow-hidden relative">
            <div class="absolute inset-0 marble-texture opacity-10 pointer-events-none"></div>
```

Replace with:
```html
        <section id="why-us" class="bg-midnight-navy text-pearl py-40 px-6 overflow-hidden relative">
            <canvas id="diamond-canvas"></canvas>
            <div class="absolute inset-0 marble-texture opacity-10 pointer-events-none"></div>
```

- [ ] **Step 3: Add `relative overflow-hidden` to Contact section and insert contact canvas**

Find:
```html
        <section id="contact" class="max-w-2xl mx-auto py-32 px-6">
            <h2 class="text-4xl md:text-6xl mb-20 font-serif text-center">Contact</h2>
```

Replace with:
```html
        <section id="contact" class="relative overflow-hidden max-w-2xl mx-auto py-32 px-6">
            <canvas id="contact-canvas"></canvas>
            <h2 class="text-4xl md:text-6xl mb-20 font-serif text-center">Contact</h2>
```

- [ ] **Step 4: Verify canvases exist in DOM**

With dev server running, open DevTools console:
```javascript
console.log(
  !!document.getElementById('globe-canvas'),
  !!document.getElementById('diamond-canvas'),
  !!document.getElementById('contact-canvas')
)
```
Expected: `true true true`

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add globe, diamond, and contact canvas elements to HTML"
```

---

### Task 3: Update style.css

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Remove the old `[data-animate]` CSS block**

Find and delete these 10 lines entirely (near the bottom of style.css):
```css
/* Animations */
[data-animate] {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 1s, transform 1s;
}

[data-animate].visible {
  opacity: 1;
  transform: translateY(0);
}
```

GSAP will own opacity and transform on these elements. Leaving this CSS would cause a conflict where the CSS keeps elements hidden even after GSAP animates them.

- [ ] **Step 2: Append canvas positioning and nav blur rules to the end of style.css**

```css
/* ── Globe canvas — fills hero, behind all content ── */
#globe-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* ── Diamond canvas — right side of Why-Us section ── */
#diamond-canvas {
  position: absolute;
  top: 50%;
  right: 4%;
  transform: translateY(-50%);
  width: 280px;
  height: 280px;
  pointer-events: none;
  z-index: 2;
  opacity: 0;
}

/* ── Contact burst canvas — fills contact section, behind form ── */
#contact-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* ── Nav frosted glass on scroll ── */
#main-nav.nav-scrolled {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
```

- [ ] **Step 3: Verify layout is unchanged**

Refresh `http://localhost:3000`. Scroll through the whole page. The `[data-animate]` elements should now be **fully visible** (since GSAP hasn't initialized yet — they'll be hidden by GSAP once it runs in later tasks). No layout shifts, no broken sections.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "feat: add canvas positioning CSS, remove conflicting data-animate rules"
```

---

### Task 4: Remove IntersectionObserver from script.js

**Files:**
- Modify: `script.js` (lines 147–160)

- [ ] **Step 1: Delete the IntersectionObserver block**

Find and delete these 14 lines:
```javascript
  // Intersection Observer for Animations
  const observerOptions = {
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
```

After deletion, the "Why Us Process Toggle" block should immediately follow the mobile menu block.

- [ ] **Step 2: Verify removal**

Confirm `script.js` no longer contains the string `IntersectionObserver` (the new ones added in later tasks use it for Three.js canvas visibility management, not for `[data-animate]`).

Open `http://localhost:3000` — page should load without errors, elements visible.

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "refactor: remove IntersectionObserver, GSAP ScrollTrigger replaces it"
```

---

### Task 5: Add Three.js Globe Scene

**Files:**
- Modify: `script.js` (append after the final `});` on line 230)

- [ ] **Step 1: Append the globe initialization IIFE to the end of script.js**

After the final `});` (which closes the `DOMContentLoaded` listener), append:

```javascript
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
    wireframe.rotation.y += 0.0008;
    ring.rotation.y      += 0.0008;
    // Smooth mouse parallax
    wireframe.rotation.x += (my - wireframe.rotation.x) * 0.05;
    wireframe.rotation.y += (mx - wireframe.rotation.y) * 0.05;
    ring.rotation.x       = wireframe.rotation.x * 0.5;
    renderer.render(scene, camera);
  };
  globeTick();

  // Resize
  window.addEventListener('resize', () => {
    const W2 = canvas.offsetWidth  || window.innerWidth;
    const H2 = canvas.offsetHeight || window.innerHeight;
    renderer.setSize(W2, H2);
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
    onEnterBack:  () => { globeActive.value = true;  canvas.style.visibility = 'visible'; globeTick(); }
  });
})();
```

- [ ] **Step 2: Verify the globe renders**

Refresh `http://localhost:3000`. You should see:
- A faint navy wireframe sphere in the hero, centered behind the text
- Three gold meridian rings at different angles
- Gold dots forming an equatorial ring
- Slow auto-rotation
- Moving the mouse tilts the globe slightly
- Scrolling down fades the globe out

If globe does not appear: DevTools console → check `THREE is not defined` (CDN issue) or canvas size 0 (canvas not positioned, check CSS added in Task 3).

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "feat: add Three.js wireframe globe to hero section"
```

---

### Task 6: Add GSAP Hero Text, Heading Reveals, and Scroll Reveals

**Files:**
- Modify: `script.js` (append after the `initGlobe` IIFE)

- [ ] **Step 1: Append hero text entrance + section heading reveals + data-animate reveals**

After the closing `})();` of `initGlobe`, append:

```javascript
// ── 2. HERO TEXT ENTRANCE ─────────────────────────────────────
(function initHeroText() {
  if (typeof gsap === 'undefined') return;
  const h1      = document.querySelector('header h1');
  const subtitle = document.querySelector('header p');
  const ctaBtns  = document.querySelectorAll('header a.btn-premium, header button.btn-premium');
  if (!h1) return;

  gsap.timeline({ delay: 0.3 })
    .from(h1, {
      y: 60, opacity: 0, rotationX: 20,
      transformPerspective: 900,
      duration: 1.1,
      ease: 'power3.out'
    })
    .from(subtitle, {
      y: 40, opacity: 0,
      duration: 0.9,
      ease: 'power2.out'
    }, '-=0.6')
    .from(ctaBtns, {
      y: 30, opacity: 0,
      stagger: 0.12,
      duration: 0.7,
      ease: 'power2.out'
    }, '-=0.5');
})();

// ── 3. SECTION HEADING FOLD-UP REVEALS ───────────────────────
(function initHeadingReveals() {
  if (typeof gsap === 'undefined') return;
  document.querySelectorAll('section h2').forEach(h2 => {
    gsap.from(h2, {
      rotationX: 85,
      opacity: 0,
      transformOrigin: 'top center',
      transformPerspective: 800,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: h2,
        start: 'top 88%',
        once: true
      }
    });
  });
})();

// ── 4. DATA-ANIMATE SCROLL REVEALS (replaces IntersectionObserver) ──
(function initScrollReveals() {
  if (typeof gsap === 'undefined') return;
  gsap.utils.toArray('[data-animate]').forEach(el => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 0.85,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true
      }
    });
  });
})();
```

- [ ] **Step 2: Verify**

Refresh and check:
- Hero headline slides up with a slight 3D fold on load
- Subtitle and buttons follow with stagger
- Scroll to Services — "Services" h2 folds up as it enters view
- Scroll to Why Choose Us — heading folds up
- Scroll to Contact — heading folds up
- Stat items, service paragraphs, and Why-Us cards all fade up on scroll

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "feat: add GSAP hero text entrance, h2 fold-up reveals, scroll fade-ins"
```

---

### Task 7: Add Service Card 3D Tilt

**Files:**
- Modify: `script.js` (append after `initScrollReveals`)

- [ ] **Step 1: Append card tilt IIFE**

```javascript
// ── 5. SERVICE CARD 3D TILT ON HOVER ─────────────────────────
(function initCardTilt() {
  if (typeof gsap === 'undefined') return;
  const cards = document.querySelectorAll('#services .grid > div');
  cards.forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    card.style.willChange     = 'transform';

    const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.4, ease: 'power2.out' });
    const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.4, ease: 'power2.out' });

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
      rotY(x * 12);
      rotX(-y * 10);
    });

    card.addEventListener('mouseleave', () => {
      rotX(0);
      rotY(0);
    });
  });
})();
```

- [ ] **Step 2: Verify tilt**

Scroll to Services. Hover slowly over each of the 4 service cards. Each card should tilt in 3D toward the cursor (rotates on both X and Y axes). Moving cursor away snaps it smoothly back to flat.

If cards are not tilting: open DevTools, confirm `gsap.quickTo` exists (GSAP 3.x only) and that `#services .grid > div` selects 4 elements (`document.querySelectorAll('#services .grid > div').length` should be `4`).

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "feat: add GSAP quickTo 3D tilt on service card hover"
```

---

### Task 8: Add Three.js Floating Diamond

**Files:**
- Modify: `script.js` (append after `initCardTilt`)

- [ ] **Step 1: Append diamond IIFE**

```javascript
// ── 6. FLOATING DIAMOND (WHY-US SECTION) ─────────────────────
(function initDiamond() {
  if (typeof THREE === 'undefined' || typeof gsap === 'undefined') return;
  const canvas = document.getElementById('diamond-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(280, 280);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
  camera.position.z = 200;

  // Outer gold wireframe octahedron
  const outerWire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.OctahedronGeometry(70, 0)),
    new THREE.LineBasicMaterial({ color: 0xA37E2C, transparent: true, opacity: 0.55 })
  );
  scene.add(outerWire);

  // Inner amber wireframe octahedron (counter-rotates)
  const innerWire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.OctahedronGeometry(42, 0)),
    new THREE.LineBasicMaterial({ color: 0xFFBF00, transparent: true, opacity: 0.2 })
  );
  scene.add(innerWire);

  let diamondTime = 0;
  let diamondRaf;

  const diamondTick = () => {
    diamondRaf = requestAnimationFrame(diamondTick);
    diamondTime += 0.016;
    outerWire.rotation.y += 0.006;
    outerWire.rotation.x += 0.002;
    innerWire.rotation.y -= 0.004;
    innerWire.rotation.x  = outerWire.rotation.x * 0.8;
    // Gentle vertical bob
    outerWire.position.y = Math.sin(diamondTime * 0.8) * 8;
    innerWire.position.y = outerWire.position.y;
    renderer.render(scene, camera);
  };

  // Pause render loop when scrolled out of view
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) diamondTick();
      else cancelAnimationFrame(diamondRaf);
    });
  }).observe(canvas);

  // Scroll entrance: scale + fade in
  gsap.fromTo(canvas,
    { opacity: 0, scale: 0.6 },
    {
      opacity: 1, scale: 1,
      duration: 1.2, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: '#why-us', start: 'top 70%', once: true }
    }
  );
})();
```

- [ ] **Step 2: Verify diamond**

Scroll to "Why Choose Us". In the upper-right area:
- A gold wireframe octahedron should scale + fade into view
- It should continuously rotate and gently bob up/down
- A dimmer amber inner octahedron counter-rotates inside it

If diamond doesn't appear: check DevTools for errors. Confirm `#diamond-canvas` has `position: absolute; top: 50%; right: 4%; width: 280px; height: 280px` (CSS added in Task 3).

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "feat: add floating Three.js wireframe diamond to Why-Us section"
```

---

### Task 9: Add Contact Particle Burst and Nav Blur

**Files:**
- Modify: `script.js` (append after `initDiamond`)

- [ ] **Step 1: Append contact burst + nav blur IIFEs**

```javascript
// ── 7. CONTACT SECTION PARTICLE BURST ────────────────────────
(function initContactBurst() {
  if (typeof THREE === 'undefined' || typeof gsap === 'undefined') return;
  const canvas = document.getElementById('contact-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.z = 300;

  const setSize = () => {
    const W = canvas.offsetWidth  || 400;
    const H = canvas.offsetHeight || 400;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  };
  setSize();
  window.addEventListener('resize', setSize);

  const COUNT     = 80;
  const positions = new Float32Array(COUNT * 3); // all zeros — burst from center
  const velocities = Array.from({ length: COUNT }, () => ({
    x: (Math.random() - 0.5) * 8,
    y: (Math.random() - 0.5) * 8,
    z: (Math.random() - 0.5) * 2
  }));

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xA37E2C, size: 2.5, transparent: true, opacity: 0.5
  }));
  scene.add(points);

  let burst    = false;
  let burstRaf;

  const burstTick = () => {
    burstRaf = requestAnimationFrame(burstTick);
    if (burst) {
      const pos = geo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        velocities[i].x *= 0.97;
        velocities[i].y *= 0.97;
        velocities[i].z *= 0.97;
        pos[i * 3]     += velocities[i].x;
        pos[i * 3 + 1] += velocities[i].y;
        pos[i * 3 + 2] += velocities[i].z;
      }
      geo.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, camera);
  };

  // Only run when in viewport
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) burstTick();
      else cancelAnimationFrame(burstRaf);
    });
  }).observe(canvas);

  // Fire burst once when contact section enters view
  ScrollTrigger.create({
    trigger: '#contact',
    start: 'top 65%',
    once: true,
    onEnter: () => {
      burst = true;
      // Animate contact form in simultaneously
      gsap.from('#contact-form', {
        scale: 0.96, opacity: 0, y: 30,
        duration: 0.9, ease: 'power2.out'
      });
    }
  });
})();

// ── 8. NAV FROSTED GLASS ON SCROLL ───────────────────────────
(function initNavBlur() {
  if (typeof ScrollTrigger === 'undefined') return;
  ScrollTrigger.create({
    start: 'top -80',
    end: 99999,
    toggleClass: { targets: '#main-nav', className: 'nav-scrolled' }
  });
})();
```

- [ ] **Step 2: Verify contact burst**

Scroll to the Contact section. On entry:
- 80 gold particles should burst outward from the center and slow to a drift
- The contact form should simultaneously scale up and fade in

- [ ] **Step 3: Verify nav blur**

Scroll down ~100px. The nav bar should have a frosted-glass blur effect (blurred content visible behind it). Scroll back to top — blur removes.

- [ ] **Step 4: Full page walkthrough — verify all 8 effects**

Do a complete scroll from top to bottom and confirm:

1. ✅ **Hero loads** → globe fades in (scale 0.85→1), headline folds up, subtitle + CTAs stagger in
2. ✅ **Scroll down ~80px** → nav gets frosted glass blur
3. ✅ **Scroll past hero** → globe fades out smoothly
4. ✅ **Trust stats section** → stat items fade up
5. ✅ **Services section** → "Services" h2 folds up; service items fade in; hover cards for 3D tilt
6. ✅ **Why Choose Us section** → "Why Choose Us" h2 folds up; cards fade in; gold diamond appears top-right, bobbing
7. ✅ **Contact section** → "Contact" h2 folds up; gold particle burst fires; form animates in

- [ ] **Step 5: Final commit**

```bash
git add script.js
git commit -m "feat: add contact particle burst, nav blur, complete 3D animation suite"
```

---

## Self-Review Checklist

**Spec coverage:**
| Spec requirement | Task |
|---|---|
| Hero Three.js globe (wireframe, gold ring, mouse parallax, scroll exit) | Task 5 |
| Hero text cinematic entrance | Task 6 |
| Section h2 rotationX fold-up reveals | Task 6 |
| data-animate scroll reveals (replace IntersectionObserver) | Task 6 |
| Service card 3D tilt + hover | Task 7 |
| Why-Us floating diamond (outer+inner octahedra, bob, scroll entrance) | Task 8 |
| Contact gold particle burst + form entrance | Task 9 |
| Nav frosted glass on scroll | Task 9 |
| CDN libraries | Task 1 |
| Canvas HTML elements | Task 2 |
| CSS: remove data-animate, add canvas rules | Task 3 |
| Remove IntersectionObserver | Task 4 |
| Performance: pixelRatio cap, off-screen pause, once:true | Tasks 5, 8, 9 |
| Zero color changes | All tasks — no new colors introduced |

All 15 spec requirements have a corresponding task. ✅
