'use strict';
const variants = { moss: 'musgo', ink: 'una tinta', paper: 'papel sobre musgo' };
const controls = document.querySelector('.signature-tools');
const preview = document.querySelector('#signature-preview');
const wordmark = document.querySelector('#preview-wordmark');
document.querySelectorAll('[data-signature]').forEach(button => {
  button.addEventListener('click', () => {
    const variant = button.dataset.signature;
    if (!Object.hasOwn(variants, variant)) return;
    wordmark.src = `assets/wordmark-horizontal-${variant}.svg`;
    wordmark.alt = `Firma horizontal en ${variants[variant]}`;
    preview.dataset.variant = variant;
    document.querySelectorAll('[data-signature]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    document.querySelector('#signature-status').textContent = `Firma en ${variants[variant]}.`;
  });
});
controls.hidden = false;
const printButton = document.querySelector('#print-kit');
printButton.hidden = false;
printButton.addEventListener('click', () => window.print());
