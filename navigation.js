'use strict';
// Keep navigation usable without JavaScript; enhance only when both elements exist.
(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  if (!toggle || !nav) return;
  const mobile = window.matchMedia(document.body.classList.contains('editorial-page') && !document.body.classList.contains('minimal-public') ? '(max-width: 1000px)' : '(max-width: 650px)');
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  function setOpen(open, restoreFocus = false) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.hidden = mobile.matches && !open;
    if (restoreFocus) toggle.focus();
  }
  function syncLayout() {
    const focusInNav = nav.contains(document.activeElement);
    toggle.hidden = !mobile.matches;
    setOpen(false, mobile.matches && focusInNav);
    if (!mobile.matches && document.activeElement === toggle) nav.querySelector('a').focus();
  }
  toggle.addEventListener('click', () => setOpen(!isOpen()));
  nav.addEventListener('click', event => {
    if (mobile.matches && event.target.closest('a')) setOpen(false, true);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches && isOpen()) setOpen(false, true);
  });
  mobile.addEventListener('change', syncLayout);
  syncLayout();
})();

// Keep content visible without scripting; animate each editorial block once on entry.
(() => {
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (reducedMotion.matches || entry.target.contains(document.activeElement)) return;
      entry.target.animate([
        { opacity: 0, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 600, delay: Number(entry.target.dataset.revealOrder || 0) * 80, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
    });
  }, { threshold: 0 });
  document.querySelectorAll('.species-card, .editorial-cover, .editorial-rail, .editorial-reading, .editorial-explore').forEach((element, index) => {
    element.dataset.revealOrder = index % 3;
    observer.observe(element);
  });
})();
