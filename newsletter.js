/* One newsletter flow across the site; never leave a failed request spinning. */
(() => {
  const form = document.getElementById('nlForm');
  if (!form) return;
  const input = document.getElementById('nlEmail');
  const button = document.getElementById('nlBtn');
  const error = document.getElementById('nlError');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (button.disabled) return;
    const email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      input.setAttribute('aria-invalid', 'true');
      error.textContent = 'Please enter a valid email address.';
      input.focus(); return;
    }
    input.removeAttribute('aria-invalid'); error.textContent = '';
    button.disabled = true; button.textContent = 'Sending…'; form.setAttribute('aria-busy', 'true');
    const request = new AbortController();
    const timer = setTimeout(() => request.abort(), 15000);
    try {
      const response = await fetch(form.action, {
        method: 'POST', signal: request.signal,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!response.ok) throw new Error('Unable to subscribe');
      form.classList.add('hidden');
      document.getElementById('nlNote').hidden = true;
      document.getElementById('nlSuccess').classList.add('show');
    } catch {
      error.textContent = 'We could not subscribe you. Please check your connection and try again.';
    } finally {
      clearTimeout(timer); button.disabled = false; button.textContent = 'Subscribe';
      form.setAttribute('aria-busy', 'false');
    }
  });
})();
