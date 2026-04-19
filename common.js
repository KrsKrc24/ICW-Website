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
document.querySelectorAll('#impact-metrics, #globe-section, #quote-band, .page-hero, #hero, #newsletter').forEach(el => {
  el.classList.add('grain');
});

/* ══ SMOOTH IMAGE FADE-IN ══ */
document.querySelectorAll('img').forEach(img => {
  if (img.complete) return;
  img.style.opacity = '0';
  img.addEventListener('load', () => { img.style.opacity = ''; }, { once: true });
});

/* ══ MAGNETIC CTA BUTTONS ══ */
document.querySelectorAll('.hero-actions .btn, .qb-btns .btn, #join-cta .btn').forEach(btn => {
  btn.style.transition = btn.style.transition || 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.22s, box-shadow 0.22s';
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) * 0.28;
    const y = (e.clientY - r.top  - r.height / 2) * 0.28;
    btn.style.transform = `translate(${x}px, ${y}px) scale(1.04)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

/* ══ SPARKLE ON DONATE BUTTON CLICK ══ */
document.querySelectorAll('a[href="donate.html"], .btn-teal, .btn-coral').forEach(el => {
  el.addEventListener('click', e => {
    miniSpark(e.clientX, e.clientY);
  });
});

/* ══ BACK TO TOP BUTTON ══ */
(function () {
  const btt = document.createElement('button');
  btt.id = 'back-to-top';
  btt.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polyline points="18 15 12 9 6 15"/></svg>`;
  btt.style.cssText = `
    position:fixed; bottom:28px; right:28px; z-index:1000;
    width:44px; height:44px; border-radius:50%; border:none; cursor:pointer;
    background:linear-gradient(135deg,var(--teal),var(--teal-dark));
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 4px 20px rgba(14,165,233,0.38);
    opacity:0; transform:translateY(12px) scale(0.9);
    transition:opacity 0.3s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    pointer-events:none;
  `;
  document.body.appendChild(btt);
  window.addEventListener('scroll', () => {
    const show = window.scrollY > 400;
    btt.style.opacity = show ? '1' : '0';
    btt.style.transform = show ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.9)';
    btt.style.pointerEvents = show ? 'auto' : 'none';
  }, { passive: true });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ══ CLICK RIPPLE ON BUTTONS ══ */
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const r = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(r.width, r.height) * 2;
  ripple.style.cssText = `
    position:absolute; border-radius:50%; pointer-events:none;
    width:${size}px; height:${size}px;
    left:${e.clientX - r.left - size/2}px; top:${e.clientY - r.top - size/2}px;
    background:rgba(255,255,255,0.22);
    transform:scale(0); animation:rippleOut 0.5s ease forwards;
  `;
  if (!document.getElementById('ripple-style')) {
    const s = document.createElement('style');
    s.id = 'ripple-style';
    s.textContent = '@keyframes rippleOut{to{transform:scale(1);opacity:0}}';
    document.head.appendChild(s);
  }
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 500);
}, true);

function miniSpark(cx, cy) {
  const colors = ['#0EA5E9','#10B981','#F97316','#8B5CF6','#FBBF24','#fff'];
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('div');
    p.style.cssText = `position:fixed;pointer-events:none;z-index:9999;
      width:5px;height:5px;border-radius:50%;
      background:${colors[i%colors.length]};
      left:${cx}px;top:${cy}px;
      transition:transform ${0.4+Math.random()*0.35}s cubic-bezier(0.16,1,0.3,1),opacity 0.3s ease ${0.15+Math.random()*0.15}s;
      opacity:1;`;
    document.body.appendChild(p);
    const a = (i/14)*Math.PI*2, d = 40 + Math.random()*55;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      p.style.transform = `translate(${Math.cos(a)*d}px,${Math.sin(a)*d - 20}px) scale(0)`;
      p.style.opacity = '0';
    }));
    setTimeout(() => p.remove(), 800);
  }
}
