/* Restore the original homepage typewriter, without shifting content below it. */
(() => {
  const phrase = document.getElementById('hero-phrase');
  const hero = document.getElementById('hero');
  if (!phrase || !hero) return;
  const words = ['Human Right.', 'Global Mission.', 'Shared Responsibility.'];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let word = 0, length = words[0].length, deleting = true;
  let inView = false, timer;
  function schedule(delay) {
    clearTimeout(timer);
    if (!motion.matches && !document.hidden && inView) timer = setTimeout(tick, delay);
  }
  function tick() {
    if (deleting) {
      length--;
      phrase.textContent = words[word].slice(0, length);
      if (length === 0) {
        deleting = false; word = (word + 1) % words.length;
        schedule(420); return;
      }
      schedule(38);
    } else {
      length++;
      phrase.textContent = words[word].slice(0, length);
      if (length === words[word].length) { deleting = true; schedule(2200); }
      else schedule(70);
    }
  }
  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    schedule(2200);
  }).observe(hero);
  document.addEventListener('visibilitychange', () => schedule(2200));
  motion.addEventListener('change', () => {
    if (motion.matches) {
      clearTimeout(timer); word = 0; length = words[0].length; deleting = true;
      phrase.textContent = words[0];
    } else schedule(2200);
  });
})();
