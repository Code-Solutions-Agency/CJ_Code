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

  function hideFallback() {
    if (fallback) fallback.hidden = true;
  }

  if (!origin || /localhost|127\.0\.0\.1/i.test(origin) || !key) {
    showFallback(
      "Set booklaneUrl in js/config.js to your public Render URL (https://….onrender.com), then push to GitHub Pages.",
    );
    return;
  }

  const maxAttempts = 15;
  const retryMs = 4000;

  function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function waitUntilLive() {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const res = await fetch(`${origin}/widget.js`, { cache: "no-store", mode: "cors" });
        if (res.ok) return true;
      } catch {
        /* Render free instances sleep; keep retrying. */
      }
      showFallback(
        attempt === 1
          ? "Starting the booking calendar… free Render services take a moment to wake."
          : `Still waking the booking calendar… (${attempt}/${maxAttempts})`,
      );
      await sleep(retryMs);
    }
    return false;
  }

  function injectWidget() {
    mount.replaceChildren();
    const script = document.createElement("script");
    script.src = `${origin}/widget.js`;
    script.async = true;
    script.setAttribute("data-public-key", key);
    script.setAttribute("data-booklane", "1");
    script.onload = hideFallback;
    script.onerror = () => {
      showFallback(
        "Booking didn’t load. Confirm the Render service is Live and booklaneUrl in js/config.js matches it.",
      );
    };
    mount.appendChild(script);
  }

  showFallback("Loading the booking calendar…");
  waitUntilLive().then((live) => {
    if (!live) {
      showFallback(
        "Booking didn’t load. Open the Render dashboard, confirm cj-code-booklane is Live, and match booklaneUrl in js/config.js.",
      );
      return;
    }
    injectWidget();
  });
})();
