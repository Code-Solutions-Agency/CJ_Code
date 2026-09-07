(() => {
  const script = document.currentScript;
  if (!script || !script.getAttribute) return;

  const key = script.getAttribute("data-public-key");
  if (!key) {
    console.warn("Booklane: missing data-public-key on the widget script.");
    return;
  }

  const origin = new URL(script.src, window.location.href).origin;
  const iframe = document.createElement("iframe");
  iframe.src = `${origin}/embed/${encodeURIComponent(key)}`;
  iframe.title = "Book an appointment";
  iframe.loading = "lazy";
  iframe.style.cssText =
    "width:100%;border:0;border-radius:16px;min-height:720px;background:transparent;display:block;";

  const wrap = document.createElement("div");
  wrap.className = "booklane-embed";
  wrap.appendChild(iframe);
  script.insertAdjacentElement("afterend", wrap);

  window.addEventListener("message", (event) => {
    if (event.origin !== origin) return;
    if (event.data && event.data.type === "booklane:height" && typeof event.data.height === "number") {
      iframe.style.height = `${Math.max(event.data.height, 480)}px`;
    }
  });
})();
