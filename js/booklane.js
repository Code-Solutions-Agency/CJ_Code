(() => {
  const mount = document.getElementById("booklane-embed");
  if (!mount) return;

  const site = window.SITE || {};
  const origin = String(site.booklaneUrl || "").replace(/\/$/, "");
  const key = site.booklanePublicKey;
  const fallback = document.getElementById("booklane-fallback");

  function showFallback(message) {
    if (!fallback) return;
    fallback.hidden = false;
    if (message) fallback.textContent = message;
  }

  if (!origin || !key) {
    showFallback("Booking isn’t configured. Set booklaneUrl and booklanePublicKey in js/config.js.");
    return;
  }

  const script = document.createElement("script");
  script.src = `${origin}/widget.js`;
  script.async = true;
  script.setAttribute("data-public-key", key);
  script.onerror = () => {
    showFallback(
      `Booking isn’t loading. Start Booklane at ${origin} (from the booking/ app), then refresh.`,
    );
  };
  mount.appendChild(script);
})();
