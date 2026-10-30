// Hero dish carousel: autoplay with progress, pause, arrows, dots, keys and swipe.
// Autoplay is off when the visitor prefers reduced motion.
(function () {
  document.querySelectorAll('.dish-carousel').forEach(function (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('.dish'));
    var dotsBox = root.querySelector('.dish-dots');
    var count = root.querySelector('.dish-count b');
    var live = root.querySelector('[aria-live]');
    var pauseBtn = root.querySelector('.dish-pause');
    var interval = Number(root.dataset.interval) || 6500;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var index = 0;
    var userPaused = reduced;
    var hoverPaused = false;

    root.style.setProperty('--dish-interval', interval + 'ms');
    if (reduced) root.classList.add('is-static');

    var dots = slides.map(function (slide, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dish-dot';
      b.setAttribute('aria-label', 'Plato ' + (i + 1) + ': ' + slide.querySelector('.sp-name').textContent);
      b.addEventListener('click', function () { go(i, true); });
      b.addEventListener('animationend', function () { if (!isPaused()) go(index + 1); });
      dotsBox.appendChild(b);
      return b;
    });

    function isPaused() { return userPaused || hoverPaused; }

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
      dots.forEach(function (d, i) {
        d.classList.toggle('is-done', i < index);
        if (i === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
      // Restart the progress animation on the current dot.
      var cur = dots[index];
      cur.style.animation = 'none'; void cur.offsetWidth; cur.style.animation = '';
      count.textContent = String(index + 1).padStart(2, '0');
      if (announce) live.textContent = slides[index].getAttribute('aria-label') + ': ' + slides[index].querySelector('.sp-name').textContent;
    }

    function go(i, announce) {
      index = (i + slides.length) % slides.length;
      render(announce);
    }

    function setPaused(p) {
      userPaused = p;
      root.classList.toggle('is-paused', isPaused());
      pauseBtn.setAttribute('aria-label', p ? 'Reanudar el carrusel' : 'Pausar el carrusel');
      pauseBtn.firstElementChild.className = p ? 'ico-play' : 'ico-pause';
      if (reduced) root.classList.toggle('is-static', p);
    }

    function setHover(p) { hoverPaused = p; root.classList.toggle('is-paused', isPaused()); }

    pauseBtn.addEventListener('click', function () { setPaused(!userPaused); });
    root.querySelector('.dish-prev').addEventListener('click', function () { go(index - 1, true); });
    root.querySelector('.dish-next').addEventListener('click', function () { go(index + 1, true); });
    root.addEventListener('mouseenter', function () { setHover(true); });
    root.addEventListener('mouseleave', function () { setHover(false); });
    root.addEventListener('focusin', function () { setHover(true); });
    root.addEventListener('focusout', function (e) { if (!root.contains(e.relatedTarget)) setHover(false); });
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

    document.addEventListener('visibilitychange', function () { setHover(document.hidden); });

    setPaused(userPaused);
    go(0, false);
  });
})();
