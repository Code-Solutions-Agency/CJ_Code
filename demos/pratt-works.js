/**
 * PrattWorks demo storefront chrome (nav only).
 * The shopper assistant lives in prattworks-chatbot/ — see INSTALL.md.
 */
(() => {
  const $ = (id) => document.getElementById(id);
  const header = $("site-header");
  const nav = $("site-nav");
  const toggle = $("nav-toggle");
  if (!header || !nav || !toggle) return;

  function setNavOpen(open) {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  toggle.addEventListener("click", () => {
    setNavOpen(!document.body.classList.contains("nav-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
      setNavOpen(false);
    }
  });

  window.matchMedia("(max-width: 900px)").addEventListener("change", (event) => {
    if (!event.matches) setNavOpen(false);
  });

  window.addEventListener(
    "scroll",
    () => {
      header.classList.toggle("scrolled", window.scrollY > 8);
    },
    { passive: true }
  );

  function openAssistant(event) {
    if (event) event.preventDefault();
    setNavOpen(false);
    if (window.PrattWorksChat) window.PrattWorksChat.open();
  }

  const navAsk = $("nav-ask");
  const heroAsk = $("hero-ask");
  if (navAsk) navAsk.addEventListener("click", openAssistant);
  if (heroAsk) heroAsk.addEventListener("click", openAssistant);
})();
