'use strict';
// Keep navigation usable without JavaScript; enhance only when both elements exist.
(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  if (!toggle || !nav) return;
  const mobile = window.matchMedia('(max-width: 650px)');
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
