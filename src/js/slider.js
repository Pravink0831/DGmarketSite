/* =====================================================================
   DGmarket · HERO SLIDE CONTROLLER  (with GLASS-MOTION transition)
   ---------------------------------------------------------------------
   Four rotating headlines, each with an outlined middle word carrying a
   brand-blue glow. Circular prev/next arrows, an "X / N" counter, dot
   indicators, keyboard arrows, touch-swipe, and 6 s auto-advance (pauses
   on hover / when the tab is hidden). No external dependency.

   GLASS MOTION:
   On every slide change a translucent frosted-glass panel sweeps across
   the hero in the direction of travel (right for next, left for prev),
   while the outgoing headline blurs out and the incoming one refracts in.
   Driven purely by CSS classes toggled here — see the "HERO SLIDER" and
   "GLASS SWEEP" blocks in src/css/input.css.

   Expected DOM (see index.html):
     [data-hero]         — hero section wrapper
     [data-slide]        — each slide panel
     [data-arrow="prev|next"]
     [data-current] / [data-total]
     [data-dot]          — dot indicators
     [data-glass]        — the glass-sweep overlay element
   ===================================================================== */
(function () {
  const hero = document.querySelector('[data-hero]');
  const slides = Array.from(document.querySelectorAll('[data-slide]'));
  if (!hero || !slides.length) return;

  const prevBtn = document.querySelector('[data-arrow="prev"]');
  const nextBtn = document.querySelector('[data-arrow="next"]');
  const curEl = document.querySelector('[data-current]');
  const totEl = document.querySelector('[data-total]');
  const dots = Array.from(document.querySelectorAll('[data-dot]'));
  const glass = document.querySelector('[data-glass]');

  const AUTOPLAY_MS = 6000;
  const GLASS_MS = 900; // must match --glass-dur in CSS
  const prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let index = 0;
  let timer = null;
  let animating = false;

  const pad = (n) => String(n).padStart(2, '0');
  if (totEl) totEl.textContent = pad(slides.length);

  // ---- Glass sweep trigger (retriggerable animation) ----
  function playGlass(direction) {
    if (!glass || prefersReduced) return;
    glass.classList.remove('is-sweeping', 'to-left', 'to-right');
    // force reflow so the animation restarts even on rapid clicks
    void glass.offsetWidth;
    glass.classList.add('is-sweeping', direction === 'prev' ? 'to-left' : 'to-right');
  }

  function paint() {
    slides.forEach((s, i) => {
      const active = i === index;
      s.classList.toggle('is-active', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    dots.forEach((d, i) => {
      const active = i === index;
      d.classList.toggle('is-active', active);
      d.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if (curEl) curEl.textContent = pad(index + 1);
  }

  function go(target, direction) {
    const count = slides.length;
    const nextIndex = (target + count) % count;
    if (nextIndex === index && animating) return;

    if (prefersReduced) {
      index = nextIndex;
      paint();
      return;
    }

    animating = true;
    playGlass(direction);

    // Swap content mid-sweep, under the frosted panel, so the change is masked
    window.setTimeout(() => {
      index = nextIndex;
      paint();
    }, GLASS_MS * 0.42);

    window.setTimeout(() => {
      animating = false;
    }, GLASS_MS);
  }

  function next() { go(index + 1, 'next'); }
  function prev() { go(index - 1, 'prev'); }

  function startAuto() {
    stopAuto();
    timer = setInterval(next, AUTOPLAY_MS);
  }
  function stopAuto() {
    if (timer) { clearInterval(timer); timer = null; }
  }
  function restart() { stopAuto(); startAuto(); }

  // ---- Controls ----
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); restart(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restart(); });

  dots.forEach((d, i) =>
    d.addEventListener('click', () => {
      const dir = i > index ? 'next' : 'prev';
      go(i, dir);
      restart();
    })
  );

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); restart(); }
    else if (e.key === 'ArrowLeft') { prev(); restart(); }
  });

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto();
    else startAuto();
  });

  // Touch swipe (mobile)
  let touchX = null;
  hero.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
      restart();
    }
    touchX = null;
  }, { passive: true });

  // ---- Init ----
  paint();
  startAuto();
})();
