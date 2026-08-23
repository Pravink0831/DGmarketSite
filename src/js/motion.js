/* =====================================================================
   DGmarket · SECTION MOTION
   Each section owns its reveal state and stagger timing. This keeps a
   section entering the viewport independent from every other section.
   ===================================================================== */
(function () {
  const sections = Array.from(document.querySelectorAll('[data-motion-section]'));
  if (!sections.length) return;

  document.documentElement.classList.add('js-motion');

  sections.forEach((section) => {
    const directChildren = Array.from(section.children);
    const cards = Array.from(section.querySelectorAll('.glass-card'));
    const ticker = section.querySelector('.ticker-track');
    const items = [...new Set([...directChildren, ...cards, ticker].filter(Boolean))];

    items.forEach((item, index) => {
      item.style.setProperty('--motion-delay', `${Math.min(index * 90, 360)}ms`);
    });
  });

  const items = Array.from(document.querySelectorAll('[data-reveal]'));
  items.forEach((item) => {
    item.classList.add('reveal');
    const variant = item.getAttribute('data-reveal');
    if (variant && variant !== 'true') item.classList.add(`reveal-${variant}`);

    const delay = Number.parseInt(item.getAttribute('data-reveal-delay'), 10);
    if (Number.isFinite(delay)) item.style.setProperty('--reveal-delay', `${delay}ms`);
  });

  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || !('IntersectionObserver' in window)) {
    sections.forEach((section) => section.classList.add('is-visible'));
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new window.IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  sections.forEach((section) => observer.observe(section));

  const revealObserver = new window.IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observerInstance.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
  );

  items.forEach((item) => revealObserver.observe(item));
})();

/* =====================================================================
   WEBARTISTA · EXPERTISE — scroll-linked entrance
   Each horizontal card travels forward from depth as the section enters
   the viewport, with a short stagger between cards.
   ===================================================================== */
(function initExpertiseEntry() {
  const section = document.querySelector('.wa-stack');
  const cards = Array.from(document.querySelectorAll('.wa-stack__card'));
  if (!section || !cards.length) return;

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const easeOut = (value) => 1 - Math.pow(1 - value, 3);
  let ticking = false;

  function reset() {
    cards.forEach((card) => {
      card.style.opacity = '1';
      card.style.transform = 'none';
      card.style.filter = 'none';
    });
  }

  if (reduce) {
    reset();
    return;
  }

  function update() {
    ticking = false;
    const viewportHeight = window.innerHeight;
    const firstCard = cards[0].getBoundingClientRect();
    const cardProgress = clamp((viewportHeight - firstCard.top) / (viewportHeight * 0.72), 0, 1);

    cards.forEach((card, index) => {
      const progress = easeOut(clamp((cardProgress - index * 0.16) / 0.56, 0, 1));
      const depth = -280 + progress * 280;
      const offsetY = 42 - progress * 42;
      const scale = 0.62 + progress * 0.38;
      const opacity = clamp(progress * 1.5, 0, 1);

      card.style.opacity = opacity.toFixed(3);
      card.style.transform =
        `translateZ(${depth.toFixed(1)}px) translateY(${offsetY.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      card.style.filter = `brightness(${(0.7 + progress * 0.3).toFixed(3)})`;
    });
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  update();
})();

