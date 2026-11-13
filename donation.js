/* Show an honest loading state and a useful fallback for PayPal checkout. */
(() => {
  const container = document.getElementById('paypal-container-76GK5SGT6BGU4');
  const status = document.getElementById('payment-status');
  if (!container || !status) return;
  container.setAttribute('aria-busy', 'true');
  const failed = () => {
    container.setAttribute('aria-busy', 'false');
    status.innerHTML = 'Payment options could not load. <a href="donate.html">Reload this page</a> or <a href="mailto:internationalchildrenwellness@gmail.com">contact ICW</a> for help.';
  };
  const timer = setTimeout(failed, 15000);
  const script = document.createElement('script');
  script.src = 'https://www.paypal.com/sdk/js?client-id=BAAgRXCWpEzbjIEW5-xF84BAmeNDtL2YRW-eLYZepBUETw6jYJMPQ1qixiNDb_gjuSw8yC8vP5aXIxQAjo&components=hosted-buttons&enable-funding=venmo&currency=USD';
  script.onerror = () => { clearTimeout(timer); failed(); };
  script.onload = async () => {
    try {
      await paypal.HostedButtons({ hostedButtonId: '76GK5SGT6BGU4' }).render('#paypal-container-76GK5SGT6BGU4');
      clearTimeout(timer);
      status.hidden = true;
      container.setAttribute('aria-busy', 'false');
    } catch {
      clearTimeout(timer);
      failed();
    }
  };
  document.head.appendChild(script);
})();
