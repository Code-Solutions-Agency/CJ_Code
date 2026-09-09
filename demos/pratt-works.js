/**
 * PrattWorks shop assistant — static teaser for maker-shop buyers.
 * Keyword replies only. No API, no live inventory, no customer PII.
 */
(() => {
  const MAX_MESSAGES = 8;
  const MAX_STOCK_CHECKS = 2;
  const SAMPLE_ORDER = "PW-4821";
  const CONTACT_HREF = "../contact.html";

  const PRODUCTS = [
    {
      id: "midnight",
      title: "Midnight Wrap",
      size: "20 oz",
      sku: "PW-MID-20",
      price: "$38",
      customizable: false,
      stock: 8,
      stockLabel: "8 on the shelf",
      match: /midnight|pw[-\s]?mid[-\s]?20|star field|navy/i,
    },
    {
      id: "meadow",
      title: "Meadow Speckle",
      size: "30 oz",
      sku: "PW-MDW-30",
      price: "$46",
      customizable: true,
      stock: 3,
      stockLabel: "3 blanks ready to wrap",
      match: /meadow|speckle|pw[-\s]?mdw[-\s]?30|sage/i,
    },
    {
      id: "copper",
      title: "Copper Canyon",
      size: "20 oz",
      sku: "PW-CPR-20",
      price: "$38",
      customizable: false,
      stock: 1,
      stockLabel: "1 left on the bench",
      match: /copper|canyon|pw[-\s]?cpr[-\s]?20/i,
    },
  ];

  const $ = (id) => document.getElementById(id);
  const header = $("site-header");
  const nav = $("site-nav");
  const toggle = $("nav-toggle");
  const panel = $("chat-panel");
  const chatToggle = $("chat-toggle");
  const chatLog = $("chat-log");
  const chatInput = $("chat-input");
  const chatForm = $("chat-form");
  const chatSend = $("chat-send");
  const chatNote = $("chat-note");
  const chips = $("chat-chips");

  let greeted = false;
  let dismissed = false;
  let userMessages = 0;
  let stockChecks = 0;
  let locked = false;

  const GREETING =
    "Hi — I’m the PrattWorks assistant. I can help with wraps, care, custom work, shipping, and a couple of sample stock checks. This is a demo preview, so I keep a short leash.";

  const CTA_HTML =
    `This preview is meant to show what a shop assistant feels like — not to run your store for free. CJ Code can build the full bot for your shop: live inventory, every order, and your real FAQs.` +
    `<br /><a href="${CONTACT_HREF}">Ask CJ Code to build the full bot</a>`;

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
    if (event.key === "Escape") {
      if (document.body.classList.contains("nav-open")) setNavOpen(false);
      else if (!panel.hasAttribute("hidden")) closeChat();
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

  function remaining() {
    return Math.max(0, MAX_MESSAGES - userMessages);
  }

  function updateNote() {
    if (locked) {
      chatNote.textContent = "Preview cap reached · CJ Code builds the full shop bot";
      return;
    }
    const q = remaining();
    const stockLeft = Math.max(0, MAX_STOCK_CHECKS - stockChecks);
    chatNote.textContent = `Preview · ${q} question${q === 1 ? "" : "s"} left · ${stockLeft} sample stock check${stockLeft === 1 ? "" : "s"} left`;
  }

  function addBubble(text, who) {
    const el = document.createElement("p");
    el.className = `chat-bubble ${who}`;
    el.textContent = text;
    chatLog.appendChild(el);
    chatLog.scrollTop = chatLog.scrollHeight;
    return el;
  }

  function addCta() {
    const el = document.createElement("p");
    el.className = "chat-bubble bot pw-cta";
    el.innerHTML = CTA_HTML;
    chatLog.appendChild(el);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function lockChat(withCta) {
    locked = true;
    chatInput.disabled = true;
    chatSend.disabled = true;
    chips.hidden = true;
    updateNote();
    if (withCta) addCta();
  }

  function findProduct(message) {
    return PRODUCTS.find((item) => item.match.test(message)) || null;
  }

  function extractOrderId(message) {
    const hit = message.match(/\b(pw[-\s]?\d{3,6})\b/i);
    if (!hit) return "";
    return hit[1].replace(/\s+/g, "").toUpperCase().replace(/^PW/, "PW-").replace("PW--", "PW-");
  }

  function normalizeOrderId(value) {
    return value.replace(/[-\s]/g, "").toUpperCase();
  }

  function wantsStock(message) {
    return /stock|inventor|available|how many|sold out|\bleft\b|do you have|on the shelf|in stock/i.test(
      message
    );
  }

  function wantsCustom(message) {
    return /custom|personaliz|monogram|name on|add (a |my )?name|put (a |my )?name|ready-?made|which (ones?|items?).*(custom|personal)/i.test(
      message
    );
  }

  function orderReply(message) {
    const id = extractOrderId(message);
    if (id && normalizeOrderId(id) === normalizeOrderId(SAMPLE_ORDER)) {
      return "Sample order PW-4821: a Meadow Speckle 30 oz is in the wrap queue and on track to ship Thursday. (Preview only — no customer name or address is stored here.)";
    }
    if (id) {
      return `I don’t have ${id} in this preview. Only the sample order PW-4821 is wired up. For a real order, email the shop with your order number.`;
    }
    return "I can look up one sample order in this preview: PW-4821. Any other number, and I’ll ask you to email the shop.";
  }

  function stockReply(product) {
    if (stockChecks >= MAX_STOCK_CHECKS) {
      return "I’ve used both sample stock checks for this preview. A live bot would read your real inventory. CJ Code can wire that up for your shop.";
    }
    stockChecks += 1;
    if (product) {
      const noun = product.stock === 1 ? "tumbler" : "tumblers";
      return `${product.title} (${product.sku}, ${product.size}) — sample stock is ${product.stockLabel}. That’s a canned number for this demo, not a live count.`;
    }
    const lines = PRODUCTS.map((item) => `${item.title}: ${item.stock} ${item.stock === 1 ? "left" : "in stock"}`);
    return `Sample shelf for this preview — ${lines.join("; ")}. Ask about a specific wrap if you want the SKU.`;
  }

  function customReply(product) {
    if (product) {
      if (product.customizable) {
        return `${product.title} can take a first name or a short phrase on the press. Add 2–4 business days. Emoji-heavy designs and full photos are outside what this listing does.`;
      }
      return `${product.title} is ready-made — it ships as designed, no custom text. Meadow Speckle is the listing that takes a name or short phrase.`;
    }
    return "Only some listings take custom work. Meadow Speckle (30 oz) can take a name or short phrase. Midnight Wrap and Copper Canyon are ready-made.";
  }

  function replyTo(message) {
    if (/software|backend|app|saas|api|code base|developer/i.test(message) && !/wrap|tumbler|cup|order|ship/i.test(message)) {
      return "I only help PrattWorks buyers with tumblers, wraps, and shop orders — not software. If you want a chatbot like this on your own site, that’s a CJ Code project.";
    }

    if (
      /\b(pw[-\s]?\d{3,6})\b/i.test(message) ||
      /order\s*(status|number|#|id)|where('?s| is) my order|track(ing)? (my )?order/i.test(message)
    ) {
      return orderReply(message);
    }

    const product = findProduct(message);
    const stock = wantsStock(message);
    const custom = wantsCustom(message);

    if (stock && custom && product) {
      const customText = customReply(product);
      if (stockChecks >= MAX_STOCK_CHECKS) {
        return `${customText} I’ve already used the sample stock checks in this preview.`;
      }
      return `${stockReply(product)} ${customText}`;
    }

    if (stock) return stockReply(product);
    if (custom) return customReply(product);

    if (/care|wash|dishwasher|microwave|fade|scratch|clean/i.test(message)) {
      return "Hand-wash the wrap side. Skip the dishwasher and the microwave — heat and soaking can dull the wrap. Daily coffee and ice water are what these are built for.";
    }

    if (/durable|last|peel|scratch|outdoor|quality|how long (does|will) (the )?wrap/i.test(message)) {
      return "The wrap is heat-set over the steel body for daily use. It isn’t a bumper sticker. Avoid soaking, dishwashers, and sharp sinksides and it should stay vivid through regular coffee runs.";
    }

    if (/material|steel|stainless|lid|bpa|what('?s| is) it made/i.test(message)) {
      return "Double-wall stainless steel, BPA-free sliding lid, full wrap on the body. 20 oz (Midnight, Copper Canyon) and 30 oz (Meadow Speckle).";
    }

    if (/size|oz\b|ounce|20|30|how big|sizing|which size/i.test(message)) {
      return "Two sizes on the bench right now: 20 oz for Midnight Wrap and Copper Canyon, 30 oz for Meadow Speckle. If you need a kids’ cup or a 40 oz, that isn’t a listing yet.";
    }

    if (/ship|process|lead|how long|when (will|does)|arrive|handmade|pack|transit/i.test(message)) {
      if (product && product.customizable) {
        return `${product.title} is a custom listing, so plan 2–4 extra business days on the press, then 3–5 to pack and about 2–6 in US transit. Ready-made wraps skip the extra press time.`;
      }
      return "Ready-made wraps: 3–5 business days to pack, then about 2–6 days in US transit. Custom Meadow Speckle adds 2–4 days on the press. I don’t drop-ship.";
    }

    if (product) {
      const extra = product.customizable
        ? "This listing can take a name or short phrase."
        : "This one is ready-made — no custom text.";
      return `${product.title} is a ${product.size} full wrap, ${product.price}. SKU ${product.sku}. ${extra} Ask if you want the sample stock number.`;
    }

    if (/price|cost|how much|\$/i.test(message)) {
      return "Midnight Wrap and Copper Canyon are $38 (20 oz). Meadow Speckle is $46 (30 oz) and is the customizable listing. This page doesn’t take payment — it’s a preview storefront.";
    }

    if (/hello|hi\b|hey|help|what can you/i.test(message)) {
      return "Ask about a wrap, whether it can be customized, sample stock, care, or shipping. I also have one sample order: PW-4821.";
    }

    return "I can talk through PrattWorks tumblers: materials and care, which wraps take custom text, handmade lead times, sample stock for Midnight / Meadow / Copper, and one sample order (PW-4821). Try a chip below, or name a wrap.";
  }

  function openChat() {
    panel.removeAttribute("hidden");
    chatToggle.setAttribute("aria-expanded", "true");
    setNavOpen(false);
    if (!greeted) {
      addBubble(GREETING, "bot");
      chips.hidden = false;
      greeted = true;
      updateNote();
    }
    if (!locked) chatInput.focus();
  }

  function closeChat(event) {
    if (event) event.stopPropagation();
    dismissed = true;
    panel.setAttribute("hidden", "");
    chatToggle.setAttribute("aria-expanded", "false");
    chatToggle.focus();
  }

  function sendMessage(text) {
    const cleaned = (text || "").trim();
    if (!cleaned || locked) return;

    addBubble(cleaned, "user");
    chatInput.value = "";
    userMessages += 1;
    chips.hidden = true;
    updateNote();

    const reply = replyTo(cleaned);
    window.setTimeout(() => {
      addBubble(reply, "bot");
      if (userMessages >= MAX_MESSAGES) lockChat(true);
    }, 280);
  }

  chatToggle.addEventListener("click", () => {
    if (panel.hasAttribute("hidden")) openChat();
    else closeChat();
  });

  $("chat-close").addEventListener("click", closeChat);

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(chatInput.value);
  });

  function bindAsk(root) {
    root.querySelectorAll("[data-ask]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const text = btn.getAttribute("data-ask") || "";
        openChat();
        sendMessage(text);
      });
    });
  }

  bindAsk(document);
  $("nav-ask").addEventListener("click", openChat);
  $("hero-ask").addEventListener("click", openChat);

  updateNote();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = window.matchMedia("(min-width: 901px)").matches;
  if (wide) {
    window.setTimeout(() => {
      if (!dismissed) openChat();
    }, reduceMotion ? 0 : 700);
  }
})();
