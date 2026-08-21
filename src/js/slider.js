/* =====================================================================
   DGmarket · HERO SLIDE CONTROLLER
   ---------------------------------------------------------------------
   A WEBARTISTA-style full-screen hero slider adapted into our cinematic
   shell. Four rotating headlines, each with an outlined middle word that
   carries a brand-blue glow. Circular prev/next arrows, an "X / N" counter,
   dot indicators, keyboard arrows, and auto-advance (pauses on hover /
   when the tab is hidden). No external dependency.

   Expected DOM (see index.html):
     [data-slide]        — each slide panel (aria-hidden toggled)
     [data-arrow="prev"] — previous button
     [data-arrow="next"] — next button
     [data-current]      — current index label (1-based)
     [data-total]        — total slides label
     [data-dot]          — dot indicator buttons (one per slide)
   ===================================================================== */
(function () {
  const slides = Array.from(document.querySelectorAll('[data-slide]'));
  if (!slides.length) return;

  const prevBtn = document.querySelector('[data-arrow="prev"]');
  const nextBtn = document.querySelector('[data-arrow="next"]');
  const curEl = document.querySelector('[data-current]');
  const totEl = document.querySelector('[data-total]');
  const dots = Array.from(document.querySelectorAll('[data-dot]'));
  const root = document.querySelector('[data-hero]') || document;

  const AUTOPLAY_MS = 6000;
  let index = 0;
  let timer = null;

  const pad = (n) => String(n).padStart(2, '0');

  if (totEl) totEl.textContent = pad(slides.length);

  function show(next) {
    const count = slides.length;
    index = (next + count) % count;

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

  function next() {
    show(index + 1);
  }
  function prev() {
    show(index - 1);
  }

  function startAuto() {
    stopAuto();
    timer = setInterval(next, AUTOPLAY_MS);
  }
  function stopAuto() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  function restart() {
    stopAuto();
    startAuto();
  }

  // ---- Controls ----
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); restart(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restart(); });

  dots.forEach((d, i) =>
    d.addEventListener('click', () => {
      show(i);
      restart();
    })
  );

  // Keyboard arrows
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); restart(); }
    else if (e.key === 'ArrowLeft') { prev(); restart(); }
  });

  // Pause on hover
  root.addEventListener('pointerenter', stopAuto, { passive: true });
  root.addEventListener('pointerleave', startAuto, { passive: true });

  // Pause when tab hidden (battery / perf)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto();
    else startAuto();
  });

  // Touch swipe (mobile)
  let touchX = null;
  root.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  root.addEventListener('touchend', (e) => {
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
  show(0);
  startAuto();
})();
