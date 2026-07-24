window.__resources = Object.assign({
  img_p_ostreatus_gris:'_standalone_imgs/grey-mushroom.png',
  img_p_ostreatus_blanco:'_standalone_imgs/orellana-blanca.png',
  img_p_djamor_rosa:'_standalone_imgs/orellana-rosa.png',
  img_p_eryngii:'_standalone_imgs/cardo.png',
  img_shiitake:'_standalone_imgs/shiitake.png',
  img_lions_mane:'_standalone_imgs/lions-mane.png',
  img_reishi:'_standalone_imgs/reishi.png',
  img_enoki:'_standalone_imgs/enoki.png',
  img_nameko:'_standalone_imgs/nameko.png',
  img_banner:'_standalone_imgs/banner.png'
}, window.__resources||{});

/* Auto-colapsar hero al primer scroll significativo */
/* DESACTIVADO: El usuario prefiere que el hero permanezca visible
(function(){
  var HIDE_AT = 220, SHOW_AT = 60, ticking = false;
  window.addEventListener('scroll', function(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      var y = window.scrollY || window.pageYOffset;
      var html = document.documentElement;
      if(!html.classList.contains('hide-hero')){
        if(y > HIDE_AT) html.classList.add('hero-auto-hidden');
        else if(y < SHOW_AT) html.classList.remove('hero-auto-hidden');
      }
      ticking = false;
    });
  }, {passive:true});
})();
*/