/* ══ SCROLL PROGRESS BAR ══ */
(function () {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const doc = document.documentElement;
    const pct = doc.scrollTop / (doc.scrollHeight - doc.clientHeight) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
})();

/* ══ GRAIN ON DARK SECTIONS ══ */
document.querySelectorAll('#impact-metrics, #globe-section, #quote-band, .page-hero, #hero').forEach(el => {
  el.classList.add('grain');
});

/* ══ SMOOTH IMAGE FADE-IN ══ */
document.querySelectorAll('img').forEach(img => {
  if (img.complete) return;
  img.style.opacity = '0';
  img.addEventListener('load', () => {
    img.style.opacity = '';
  }, { once: true });
});

