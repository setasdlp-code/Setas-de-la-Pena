// Homepage hero dish carousel: manual navigation with arrows, keys and swipe.
(function () {
  document.querySelectorAll('.dish-carousel').forEach(function (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('.dish'));
    var live = root.querySelector('[aria-live]');
    var index = 0;

    root.querySelector('.dish-controls').hidden = false;

    function render(announce) {
      slides.forEach(function (s, i) {
        var on = i === index;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
        s.inert = !on;
        if (on || i === (index + 1) % slides.length) {
          var img = s.querySelector('img');
          if (img.loading === 'lazy') img.loading = 'eager';
        }
      });
      if (announce) live.textContent = slides[index].getAttribute('aria-label') + ': ' + slides[index].querySelector('.dish-name').textContent;
    }

    function go(i, announce) {
      index = (i + slides.length) % slides.length;
      render(announce);
    }

    root.querySelector('.dish-prev').addEventListener('click', function () { go(index - 1, true); });
    root.querySelector('.dish-next').addEventListener('click', function () { go(index + 1, true); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(index + 1, true); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(index - 1, true); e.preventDefault(); }
    });

    var startX = null;
    root.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') startX = e.clientX; });
    root.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX; startX = null;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1), true);
    });

    go(0, false);
  });
})();
