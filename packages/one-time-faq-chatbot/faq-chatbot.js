/**
 * One-time FAQ chatbot.
 * Scripted answers from window.FAQ_CHAT. No API key, no account, no monthly model call.
 * Load sample-config.js first, or set window.FAQ_CHAT yourself. See INSTALL.md.
 */
(() => {
  "use strict";

  if (window.FaqChat && (window.FaqChat._ready || window.FaqChat._booting)) return;
  window.FaqChat = { _booting: true };

  const SCRIPT_SRC = (document.currentScript && document.currentScript.src) || "";

  const STOP = new Set([
    "a", "an", "the", "and", "or", "to", "of", "in", "on", "for", "is", "are",
    "do", "does", "did", "you", "your", "we", "our", "i", "me", "my", "it",
    "this", "that", "with", "what", "how", "when", "where", "who", "can",
    "could", "please", "about", "from", "have", "has", "was", "be", "if",
    "at", "by", "not", "just", "the",
  ]);

  const TERM_GROUPS = [
    ["price", "pricing", "cost", "costs", "fee", "fees", "quote", "estimate", "rate", "rates", "expensive", "cheap", "how much"],
    ["hour", "hours", "open", "opening", "close", "closed", "closing", "sunday", "monday", "saturday", "tuesday", "weekday", "weekend", "what time"],
    ["book", "booking", "appointment", "contact", "email", "phone", "schedule", "book a call", "get in touch"],
    ["where", "location", "address", "visit", "in person"],
    ["service", "services", "offer", "offers", "what do you do", "what do you offer"],
    ["next", "after", "happens", "process", "expect", "confirm", "confirmation", "what happens", "what happens next"],
    ["person", "human", "bot", "robot", "real person"],
  ];

  const GREET_RE = /^(hi|hello|hey|hiya|good morning|good afternoon|good evening)[.!\s]*$/i;
  const THANKS_RE = /^(thanks|thank you|thx)( so much| a lot)?[.!\s]*$/i;

  function cleanLabel(value, fallback, max) {
    const text = String(value == null ? "" : value)
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return fallback;
    return text.slice(0, max);
  }

  function fillWith(text, businessName) {
    return String(text || "").replace(/\{\{\s*businessName\s*\}\}/g, () => businessName);
  }

  function safeUrl(value) {
    const url = String(value || "").trim();
    if (!url || /[\s<>"\\]/.test(url)) return "";
    if (/^#[A-Za-z0-9_-]*$/.test(url)) return url;
    if (url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\")) return url;
    if (/^mailto:[^\s<>"\\]+$/i.test(url)) return url;
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") return url;
    } catch (err) {
      return "";
    }
    return "";
  }

  function normalizeFaqs(list) {
    if (!Array.isArray(list)) return [];
    const out = [];
    for (let i = 0; i < list.length && out.length < 40; i += 1) {
      const item = list[i] || {};
      const q = cleanLabel(item.q, "", 180);
      const a = cleanLabel(item.a, "", 1200);
      if (!q || !a) continue;
      const keywords = Array.isArray(item.keywords)
        ? item.keywords.map((keyword) => cleanLabel(keyword, "", 48)).filter(Boolean).slice(0, 16)
        : [];
      out.push({ q, a, keywords });
    }
    return out;
  }

  function builtinFaqs() {
    return [
      {
        q: "What are your hours?",
        keywords: ["hours", "hour", "open", "closed", "close", "saturday", "sunday", "monday"],
        a: "{{businessName}} lists hours on this site. Use Book a call if you need a time that is not listed.",
      },
      {
        q: "What services do you offer?",
        keywords: ["service", "services", "offer", "what do you do", "what do you offer"],
        a: "{{businessName}} can walk through services on a short call. Use Book a call and tell us what you need.",
      },
      {
        q: "How do I book or contact you?",
        keywords: ["book", "booking", "book a call", "contact", "email", "phone", "schedule", "appointment"],
        a: "Use Book a call in this chat. It opens the booking or contact link for {{businessName}}.",
      },
    ];
  }

  function prepareFaqs(list, businessName) {
    const source = normalizeFaqs(list);
    const faqs = source.length ? source : normalizeFaqs(builtinFaqs());
    return faqs.map((faq) => ({
      q: faq.q,
      keywords: faq.keywords,
      a: fillWith(faq.a, businessName),
    }));
  }

  function readQuickReplies(value, faqs) {
    if (Array.isArray(value)) {
      return value.map((item) => cleanLabel(item, "", 80)).filter(Boolean).slice(0, 6);
    }
    return faqs.slice(0, 4).map((faq) => faq.q);
  }

  function readConfig() {
    const raw = window.FAQ_CHAT && typeof window.FAQ_CHAT === "object" ? window.FAQ_CHAT : {};
    const businessName = cleanLabel(raw.businessName, "Your Business", 80);
    const faqs = prepareFaqs(raw.faqs, businessName);
    const greeting =
      fillWith(raw.greeting, businessName) ||
      fillWith(
        "Hi, I'm the {{businessName}} assistant. I can help with common questions and how to book a call. I'm a scripted FAQ assistant, not a person.",
        businessName
      );
    const fallback =
      fillWith(raw.fallback, businessName) ||
      fillWith(
        "I'm not sure about that one. Use Book a call and someone from {{businessName}} will follow up.",
        businessName
      );
    const nudge = fillWith(raw.nudge, businessName) || "Ask a question, or use Book a call if you want a person.";
    return {
      businessName,
      accentColor: String(raw.accentColor || "").trim(),
      bookingUrl: safeUrl(raw.bookingUrl),
      bookingLabel: cleanLabel(raw.bookingLabel, "Book a call", 40),
      launcherLabel: cleanLabel(raw.launcherLabel, "Ask a question", 40),
      panelTitle: cleanLabel(raw.panelTitle, "Ask a question", 48),
      inputPlaceholder: cleanLabel(raw.inputPlaceholder, "Ask a question", 80),
      samplePreview: raw.samplePreview === true,
      autoOpen: raw.autoOpen === true,
      greeting: cleanLabel(greeting, greeting, 500),
      fallback: cleanLabel(fallback, fallback, 500),
      nudge: cleanLabel(nudge, nudge, 240),
      quickReplies: readQuickReplies(raw.quickReplies, faqs),
      faqs,
    };
  }

  function parseHex(input) {
    const match = String(input || "").trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return null;
    let hex = match[1];
    if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
      hex: "#" + hex.toLowerCase(),
    };
  }

  function channel(value) {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }

  function relLum(rgb) {
    return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
  }

  function contrast(a, b) {
    const lighter = Math.max(a, b);
    const darker = Math.min(a, b);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function mix(rgb, target, amount) {
    const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
    return {
      r: clamp(rgb.r + (target.r - rgb.r) * amount),
      g: clamp(rgb.g + (target.g - rgb.g) * amount),
      b: clamp(rgb.b + (target.b - rgb.b) * amount),
    };
  }

  function rgbCss(rgb) {
    return "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
  }

  function applyTheme(root, accentValue) {
    const accent = parseHex(accentValue) || parseHex("#1d6a4f");
    const hover = mix(accent, { r: 0, g: 0, b: 0 }, 0.16);
    const light = { r: 247, g: 244, b: 238 };
    const dark = { r: 36, g: 31, b: 27 };
    const accentLum = relLum(accent);
    const ink = contrast(accentLum, relLum(light)) >= contrast(accentLum, relLum(dark)) ? "#f7f4ee" : "#241f1b";
    root.style.setProperty("--fc-accent", accent.hex);
    root.style.setProperty("--fc-accent-hover", rgbCss(hover));
    root.style.setProperty("--fc-accent-ink", ink);
    root.style.setProperty("--fc-accent-dim", "rgba(" + accent.r + ", " + accent.g + ", " + accent.b + ", 0.12)");
    root.style.setProperty("--fc-accent-line", "rgba(" + accent.r + ", " + accent.g + ", " + accent.b + ", 0.28)");
  }

  function cssHref(scriptSrc) {
    if (!scriptSrc) return "faq-chatbot.css";
    try {
      const url = new URL(scriptSrc, window.location.href);
      url.pathname = url.pathname.replace(/[^/]+$/, "faq-chatbot.css");
      return url.href;
    } catch (err) {
      return "faq-chatbot.css";
    }
  }

  function loadCss() {
    if (document.getElementById("fc-chat-css")) return;
    const link = document.createElement("link");
    link.id = "fc-chat-css";
    link.rel = "stylesheet";
    link.href = cssHref(SCRIPT_SRC);
    document.head.appendChild(link);
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function hasTerm(normalizedText, term) {
    const needle = normalize(term);
    if (!needle || !normalizedText) return false;
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
    return new RegExp("(?:^|\\s)" + escaped + "(?:$|\\s)").test(normalizedText);
  }

  function tokens(value) {
    return normalize(value)
      .split(" ")
      .filter((word) => word.length >= 3 && !STOP.has(word));
  }

  function groupBoost(normalized, faq) {
    let extra = 0;
    TERM_GROUPS.forEach((group) => {
      const messageHit = group.some((term) => hasTerm(normalized, term));
      if (!messageHit) return;
      const keywordHit = (faq.keywords || []).some((keyword) => {
        const keyNorm = normalize(keyword);
        return group.some((term) => hasTerm(keyNorm, term));
      });
      const questionHit = group.some((term) => hasTerm(normalize(faq.q), term));
      if (keywordHit || questionHit) extra += 6;
    });
    return extra;
  }

  function scoreFaq(normalized, faq) {
    let score = 0;
    (faq.keywords || []).forEach((keyword) => {
      if (!hasTerm(normalized, keyword)) return;
      score += normalize(keyword).indexOf(" ") === -1 ? 3 : 8;
    });
    const qTokens = new Set(tokens(faq.q));
    tokens(normalized).forEach((token) => {
      if (qTokens.has(token)) score += 2;
    });
    return score + groupBoost(normalized, faq);
  }

  function bestFaq(faqs, normalized) {
    let best = null;
    let bestScore = 0;
    faqs.forEach((faq) => {
      const score = scoreFaq(normalized, faq);
      if (score > bestScore) {
        best = faq;
        bestScore = score;
      }
    });
    return bestScore >= 3 ? best : null;
  }

  function isLooseGreeting(message) {
    const words = message.trim().split(/\s+/);
    return words.length <= 4 && /^(hi|hello|hey|hiya|good morning|good afternoon|good evening)\b/i.test(message.trim());
  }

  function replyFor(cfg, message) {
    const trimmed = String(message || "").trim();
    const normalized = normalize(trimmed);
    const faq = bestFaq(cfg.faqs, normalized);
    if (faq) return faq.a;
    if (GREET_RE.test(trimmed) || isLooseGreeting(trimmed)) return cfg.nudge;
    if (THANKS_RE.test(trimmed)) return "Glad that helped. Use Book a call if you want a person to follow up.";
    return cfg.fallback;
  }

  function mount(cfg) {
    if (document.getElementById("fc-chat")) return;
    const root = document.createElement("div");
    root.className = "fc-chat";
    root.id = "fc-chat";
    applyTheme(root, cfg.accentColor);
    root.innerHTML = [
      '<section class="fc-chat-panel" id="fc-chat-panel" role="region" aria-labelledby="fc-chat-title" hidden>',
      '  <header class="fc-chat-head">',
      "    <div>",
      '      <p class="fc-chat-kicker" id="fc-chat-kicker"></p>',
      '      <p class="fc-chat-title" id="fc-chat-title"></p>',
      "    </div>",
      '    <button type="button" class="fc-chat-close" id="fc-chat-close">Close</button>',
      "  </header>",
      '  <div class="fc-chat-log" id="fc-chat-log" role="log" aria-live="polite" aria-relevant="additions"></div>',
      '  <div class="fc-chat-chips" id="fc-chat-chips" role="group" aria-label="Suggested questions"></div>',
      '  <div class="fc-chat-book-slot" id="fc-chat-book-slot"></div>',
      '  <form class="fc-chat-form" id="fc-chat-form">',
      '    <label class="fc-sr" for="fc-chat-input">Your message</label>',
      '    <input class="fc-chat-input" id="fc-chat-input" type="text" maxlength="500" autocomplete="off" />',
      '    <button class="fc-chat-send" type="submit">Send</button>',
      "  </form>",
      '  <p class="fc-chat-note" id="fc-chat-note"></p>',
      "</section>",
      '<button type="button" class="fc-chat-toggle" id="fc-chat-toggle" aria-expanded="false" aria-controls="fc-chat-panel"></button>',
    ].join("");
    document.body.appendChild(root);

    const panel = root.querySelector(".fc-chat-panel");
    const toggle = root.querySelector(".fc-chat-toggle");
    const closeBtn = root.querySelector(".fc-chat-close");
    const log = root.querySelector(".fc-chat-log");
    const chips = root.querySelector(".fc-chat-chips");
    const form = root.querySelector(".fc-chat-form");
    const input = root.querySelector(".fc-chat-input");
    const kicker = root.querySelector(".fc-chat-kicker");
    const title = root.querySelector(".fc-chat-title");
    const note = root.querySelector(".fc-chat-note");
    const bookSlot = root.querySelector(".fc-chat-book-slot");

    kicker.textContent = cfg.samplePreview ? "Sample preview" : cfg.businessName;
    title.textContent = cfg.samplePreview ? cfg.businessName : cfg.panelTitle;
    note.textContent = cfg.samplePreview
      ? "Sample preview. Scripted FAQ. Nothing is sent off this page."
      : "Answers come from this site's FAQ.";
    toggle.textContent = cfg.launcherLabel;
    toggle.setAttribute("aria-label", cfg.launcherLabel + ". " + cfg.businessName);
    input.placeholder = cfg.inputPlaceholder;

    if (cfg.bookingUrl) {
      const link = document.createElement("a");
      link.className = "fc-chat-book";
      link.href = cfg.bookingUrl;
      link.textContent = cfg.bookingLabel;
      if (/^https?:\/\//i.test(cfg.bookingUrl)) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      link.addEventListener("click", () => {
        closeChat();
      });
      bookSlot.appendChild(link);
    }

    cfg.quickReplies.forEach((label) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", () => {
        openChat();
        sendMessage(label);
      });
      chips.appendChild(button);
    });

    let greeted = false;
    let dismissed = false;

    function addBubble(text, who) {
      const el = document.createElement("p");
      el.className = "fc-chat-bubble " + who;
      el.textContent = text;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
    }

    function openChat(options) {
      const focus = !options || options.focus !== false;
      panel.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
      if (!greeted) {
        addBubble(cfg.greeting, "bot");
        greeted = true;
      }
      if (focus) {
        try {
          input.focus({ preventScroll: true });
        } catch (err) {
          input.focus();
        }
      }
    }

    function closeChat() {
      dismissed = true;
      panel.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
    }

    function sendMessage(raw) {
      const text = String(raw || "").replace(/\s+/g, " ").trim().slice(0, 500);
      if (!text) return;
      if (!greeted) openChat({ focus: false });
      addBubble(text, "user");
      input.value = "";
      addBubble(replyFor(cfg, text), "bot");
    }

    toggle.addEventListener("click", () => {
      if (panel.hasAttribute("hidden")) openChat();
      else closeChat();
    });
    closeBtn.addEventListener("click", closeChat);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      sendMessage(input.value);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hasAttribute("hidden")) {
        closeChat();
        toggle.focus();
      }
    });
    document.addEventListener("click", (event) => {
      const opener = event.target.closest("[data-faq-chat-open]");
      if (!opener || opener.closest(".fc-chat")) return;
      if (opener.tagName === "A") event.preventDefault();
      openChat();
      const preset = opener.getAttribute("data-faq-chat-ask");
      if (preset) sendMessage(preset);
    });

    window.FaqChat = {
      _ready: true,
      open: openChat,
      close: closeChat,
      ask(text) {
        openChat({ focus: false });
        sendMessage(text);
      },
    };

    if (cfg.autoOpen && window.matchMedia("(min-width: 901px)").matches) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.setTimeout(() => {
        if (!dismissed) openChat({ focus: false });
      }, reduce ? 0 : 500);
    }
  }

  loadCss();
  const cfg = readConfig();

  function start() {
    mount(cfg);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
