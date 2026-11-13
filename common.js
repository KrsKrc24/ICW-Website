/* Shared interactions. Decorative motion is intentionally omitted. */
(function () {
  const button = document.createElement('button');
  button.id = 'back-to-top';
  button.type = 'button';
  button.textContent = 'Back to top';
  button.hidden = true;
  document.body.appendChild(button);
  const update = () => { button.hidden = window.scrollY < 500; };
  window.addEventListener('scroll', update, { passive: true });
  update();
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'auto' }));
})();

/* Keep the mobile menu state available to assistive technology. */
(function () {
  const button = document.getElementById('menuBtn');
  const links = document.getElementById('navLinks');
  if (!button || !links) return;
  const sync = () => button.setAttribute('aria-expanded', String(links.classList.contains('open')));
  new MutationObserver(sync).observe(links, { attributes: true, attributeFilter: ['class'] });
  sync();
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && links.classList.contains('open')) {
      links.classList.remove('open');
      button.focus();
    }
  });
})();

/* Make team biographies available without a mouse. */
document.querySelectorAll('.member-card, .founder-card').forEach(card => {
  if (!card.querySelector('.mc-inner, .fc-inner')) return;
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Biography of ${card.dataset.name || 'team member'}`);
  const sync = () => {
    const flipped = card.classList.contains('flipped');
    card.setAttribute('aria-pressed', String(flipped));
    card.querySelector('.mc-front, .fc-front')?.setAttribute('aria-hidden', String(flipped));
    card.querySelector('.mc-back, .fc-back')?.setAttribute('aria-hidden', String(!flipped));
  };
  new MutationObserver(sync).observe(card, { attributes: true, attributeFilter: ['class'] });
  sync();
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      card.click();
    }
  });
});

/* Explore a few encouragement messages without collecting or sending data. */
(() => {
  const button = document.getElementById('card-next');
  const message = document.getElementById('card-message');
  if (!button || !message) return;
  const messages = [
    message.textContent,
    'A small hello, a big cheer, and a reminder that someone is thinking of you.',
    'Wishing you a moment of joy today, whether it is a favorite story, a silly joke, or a good song.'
  ];
  let current = 0;
  button.addEventListener('click', () => {
    current = (current + 1) % messages.length;
    message.textContent = messages[current];
  });
})();
