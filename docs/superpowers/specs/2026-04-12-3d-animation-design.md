# 3D Animation Design — Advertize.World
**Date:** 2026-04-12  
**Status:** Approved  
**Approach:** Option A — Cinematic Globe  
**Libraries:** Three.js (r128) + GSAP 3 + ScrollTrigger plugin

---

## Overview

Add immersive 3D animations and scroll-triggered effects to the existing Advertize.World static site. The design preserves the full existing color theme and layout — no structural HTML changes, no color changes. All 3D and animation layers are purely additive.

**Color constraints (non-negotiable):**
- Pearl background: `#FDFCFB`
- Midnight Navy text/lines: `#000C1D`
- Antique Gold accents: `#A37E2C`
- Amber accent: `#FFBF00`
- No new colors introduced

---

## Site Background Reality

The site is **predominantly light (pearl `#FDFCFB`)** — not dark:
- **Light sections** (pearl bg): Hero, Trust stats, About quote, Services, Contact
- **Dark sections** (navy `#000C1D` bg): "Why Choose Us", Footer

This distinction drives all 3D color decisions. Globe wireframe uses navy on pearl. Bold gold effects reserved for the dark sections.

---

## Architecture

### Files Changed
| File | Change |
|---|---|
| `index.html` | Add CDN `<script>` tags for Three.js + GSAP in `<head>`. Add `id` attributes to existing sections for ScrollTrigger targeting. Add a `<canvas id="globe-canvas">` inside the hero `<header>`. Add a `<canvas id="diamond-canvas">` inside the `#why-us` section. Add `position: relative` to the hero `<header>` element so the globe canvas can anchor to it. |
| `script.js` | Preserve existing particle canvas code. Remove existing `IntersectionObserver` block that adds `.visible` class (replaced by GSAP). Append new self-contained block: Three.js globe, Three.js diamond, GSAP scroll animations, card tilt logic. |
| `style.css` | **Remove** the `[data-animate]` initial state rules (`opacity: 0; transform: translateY(20px)`) and `.visible` rules — GSAP owns these states entirely to avoid conflicts. Add positioning rules for new canvases and perspective wrappers for card tilt. |

**Note on `#why-us`:** This section already has `overflow-hidden relative` Tailwind classes, so the diamond canvas (`position: absolute`) will anchor correctly within it without any additional changes.

### Libraries (CDN, no build step)
```html
<!-- Three.js r128 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<!-- GSAP + ScrollTrigger -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
```

All three loaded at the bottom of `<body>`, before `script.js`.

---

## Feature Specifications

### 1. Hero — Three.js Wireframe Globe

**Canvas:** `<canvas id="globe-canvas">` absolutely positioned inside the `<header>`, behind the text (`z-index: 1`). Text content remains at `z-index: 10`.

**Three.js scene:**
- `SphereGeometry(180, 24, 16)` rendered as `WireframeGeometry`
- Material: `LineBasicMaterial`, color `#000C1D`, opacity `0.12`, transparent
- Three longitude ellipses as additional `EllipseCurve` lines in gold `#A37E2C` at opacity `0.18`
- Equatorial gold particle ring: `BufferGeometry` with 120 points orbiting the equator, `PointsMaterial` color `#A37E2C`, size `1.2`, opacity `0.35`
- Auto-rotates on Y axis: `0.0008` radians/frame
- Mouse parallax: on `mousemove`, globe tilts ±6° on X/Y axes via GSAP `quickTo` (smooth interpolation, no snap)

**Page load entrance:**
```
gsap.from(globe, { duration: 1.4, scale: 0.75, opacity: 0, ease: "power2.out" })
```

**Scroll exit:** As user scrolls past hero, `ScrollTrigger` scrubs globe `scale: 1 → 0.6, opacity: 1 → 0` over the first 30% of scroll distance. Globe canvas visibility: `hidden` after hero leaves viewport (performance).

**Existing particle canvas:** Remains unchanged. Its `z-index: 0` places it behind the globe canvas (`z-index: 1`). Both coexist.

---

### 2. Hero Text — Cinematic Entrance

**Target:** The `<h1>` and `<p>` subtitle in the hero.

Split headline into two lines (already line-broken with `<br />`). Each line animates independently:
```
gsap.from([line1, line2, subtitle], {
  y: 60, opacity: 0, rotationX: 20,
  transformPerspective: 900,
  stagger: 0.18,
  duration: 1.1,
  ease: "power3.out",
  delay: 0.3
})
```
CTA buttons animate in last with `stagger: 0.12, y: 30, opacity: 0`.

---

### 3. Section Headings — 3D Fold-Up Reveal (ScrollTrigger)

**Targets:** All `<h2>` elements (Services, Why Choose Us, Contact).

Each heading wraps in a `div` with `overflow: hidden` and `perspective: 800px`. On scroll trigger:
```
gsap.from(h2, {
  rotationX: 85,
  opacity: 0,
  transformOrigin: "top center",
  duration: 0.9,
  ease: "power3.out",
  scrollTrigger: { trigger: h2, start: "top 88%" }
})
```
Effect: heading appears to "fold up" from flat into upright view as the section enters viewport.

---

### 4. Body Text & Cards — Fade + Rise (ScrollTrigger)

**Targets:** All `[data-animate]` elements (already present on paragraphs, stat items, service items, "Why Us" cards).

Replace the existing CSS-transition `[data-animate]` system with GSAP ScrollTrigger equivalents for consistency and smoother timing:
```
gsap.from("[data-animate]", {
  y: 40, opacity: 0, duration: 0.85,
  ease: "power2.out",
  stagger: 0.1,
  scrollTrigger: { trigger: el, start: "top 85%" }
})
```
The existing IntersectionObserver in `script.js` that adds `.visible` class is removed and replaced by this GSAP block.

---

### 5. Services Cards — 3D Tilt on Hover

**Targets:** The four `border-l` service card `<div>`s in `#services`.

Each card gets a `perspective: 1000px` CSS wrapper. On `mousemove` over a card:
- Calculate cursor offset from card center as a fraction (-1 to 1)
- Apply `rotateY: offset.x * 12` and `rotateX: -offset.y * 10` via GSAP `quickTo`
- Apply a `radial-gradient` highlight that follows cursor (simulates light reflection)

On `mouseleave`: spring back to flat via `gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power2.out" })`.

---

### 6. "Why Choose Us" Section — Floating 3D Diamond

**Canvas:** `<canvas id="diamond-canvas">` absolutely positioned in the top-right of the `#why-us` section (right side, vertically centered), 280×280px. `z-index: 2`, `pointer-events: none`.

**Three.js scene:**
- `OctahedronGeometry(70, 0)` rendered as `WireframeGeometry`
- Material: `LineBasicMaterial`, color `#A37E2C`, opacity `0.55`, transparent
- Inner octahedron: `OctahedronGeometry(40, 0)`, color `#FFBF00`, opacity `0.2`
- Continuous slow rotation: `rotation.y += 0.006`, `rotation.x += 0.002` per frame
- Y-axis bobbing: `position.y = Math.sin(time * 0.8) * 8`

**Scroll entrance (ScrollTrigger):**
```
gsap.from(diamond.rotation, {
  y: Math.PI,
  duration: 1.4,
  ease: "power3.out",
  scrollTrigger: { trigger: "#why-us", start: "top 70%" }
})
gsap.from(diamondCanvas, {
  opacity: 0, scale: 0.6, duration: 1.2, ease: "back.out(1.4)",
  scrollTrigger: { trigger: "#why-us", start: "top 70%" }
})
```

---

### 7. Contact Section — Gold Particle Burst

**Canvas:** `<canvas id="contact-canvas">` absolutely positioned behind the contact form, full section width, `z-index: 0`, `pointer-events: none`.

**Three.js scene:**
- 80 `Points` particles initialized at center (`x:0, y:0, z:0`)
- On ScrollTrigger fire (section enters viewport at 60%): particles burst outward using randomized velocity vectors, then slow to a gentle drift
- Each frame: `velocity *= 0.96` (exponential decay), particles drift after burst settles
- Color: `#A37E2C`, point size `2.0`, opacity `0.5`
- One-shot trigger: fires once per page load, does not re-fire on scroll back

**Form entrance:** Simultaneously with burst:
```
gsap.from("#contact-form", {
  scale: 0.96, opacity: 0, y: 30,
  duration: 0.9, ease: "power2.out",
  scrollTrigger: { trigger: "#contact", start: "top 65%", once: true }
})
```

---

### 8. Navigation Scroll Behaviour (Enhancement)

Existing scroll behaviour: nav switches classes between light/dark. Enhance by adding GSAP to smooth the nav background transition with a subtle blur backdrop when scrolled:
```
ScrollTrigger.create({
  start: "top -80",
  onEnter: () => gsap.to("nav", { backdropFilter: "blur(12px)", duration: 0.4 }),
  onLeaveBack: () => gsap.to("nav", { backdropFilter: "blur(0px)", duration: 0.4 })
})
```

---

## Performance Constraints

- All Three.js `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` — cap at 2x for retina without burning mobile GPUs
- Three.js canvases use `alpha: true` so pearl background shows through
- Globe canvas hides (`visibility: hidden`) when scrolled out of view, resumes when in view
- Diamond and contact canvases use `IntersectionObserver` to pause `requestAnimationFrame` loops when off-screen
- No Three.js canvas exceeds 600×600px
- GSAP ScrollTrigger `once: true` on one-shot animations (contact burst, heading reveals) — no re-triggering cost

---

## What Does NOT Change

- All HTML structure, section order, copy
- All colors: pearl, navy, gold, amber — no additions
- All existing CSS classes and Tailwind utilities
- Button styles, nav links, footer layout
- Contact form logic and API in `server.ts`
- Existing particle canvas in `script.js` (gold dots)
- Mobile menu behaviour
- WhatsApp floating CTA
