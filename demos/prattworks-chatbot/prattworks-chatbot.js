/**
 * PrattWorks shopper assistant — capped static teaser.
 * Drop this file on a site (see INSTALL.md). No API keys, no live inventory.
 */
(() => {
  if (window.PrattWorksChat && window.PrattWorksChat._ready) return;

  const cfg = Object.assign(
    {
      shopName: "PrattWorks",
      contactHref: "",
      contactLabel: "Ask CJ Code to build the full bot",
      autoOpenDesktop: true,
    },
    window.PRATTWORKS_CHAT || {}
  );

  const MAX_MESSAGES = 8;
  const MAX_STOCK_CHECKS = 2;
  const SAMPLE_ORDER = "PW-4821";

  const PRODUCTS = [
    {
      id: "midnight",
      title: "Midnight Wrap",
      size: "20 oz",
      sku: "PW-MID-20",
      price: "$38",
      personalizable: false,
      stock: 8,
      stockLabel: "8 on the shelf",
      blurb: "Deep navy field with a faint star scatter.",
      match: /midnight|pw[-\s]?mid[-\s]?20|star field|navy/i,
    },
    {
      id: "meadow",
      title: "Meadow Speckle",
      size: "30 oz",
      sku: "PW-MDW-30",
      price: "$46",
      personalizable: true,
      stock: 3,
      stockLabel: "3 on the shelf",
      blurb: "Sage and cream speckle wrap.",
      match: /meadow|speckle|pw[-\s]?mdw[-\s]?30|sage/i,
    },
    {
      id: "copper",
      title: "Copper Canyon",
      size: "20 oz",
      sku: "PW-CPR-20",
      price: "$38",
      personalizable: false,
      stock: 1,
      stockLabel: "1 left",
      blurb: "Warm copper wrap over stainless.",
      match: /copper|canyon|pw[-\s]?cpr[-\s]?20/i,
    },
  ];

  const GREETING =
    "Hi — I’m the PrattWorks assistant. Ask about an order, tumbler sizes, or the wraps in the shop. This is a demo preview, so I keep a short leash.";

  function ctaHtml() {
    const href = cfg.contactHref || "#";
    return (
      `This preview is meant to show what a shop assistant feels like — not to run your store for free. CJ Code can build the full bot for your shop: live inventory, every order, and your real FAQs.` +
      `<br /><a href="${href}">${cfg.contactLabel}</a>`
    );
  }

  function loadCss() {
    if (document.getElementById("pw-chat-css")) return;
    const script = document.currentScript;
    const src = script && script.src ? script.src : "";
    const href = src.replace(/prattworks-chatbot\.js(\?.*)?$/i, "prattworks-chatbot.css$1");
    const link = document.createElement("link");
    link.id = "pw-chat-css";
    link.rel = "stylesheet";
    link.href = href || "prattworks-chatbot.css";
    document.head.appendChild(link);
  }

  function mount() {
    if (document.getElementById("pw-chat")) return;
    const root = document.createElement("div");
    root.className = "pw-chat";
    root.id = "pw-chat";
    root.innerHTML = `
      <div class="pw-chat-panel" id="pw-chat-panel" hidden>
        <header class="pw-chat-head">
          <div>
            <p class="pw-chat-kicker">Demo preview · ${cfg.shopName} assistant</p>
            <p class="pw-chat-title">Ask about tumblers</p>
          </div>
          <button type="button" class="pw-chat-close" id="pw-chat-close" aria-label="Close chat">Close</button>
        </header>
        <div class="pw-chat-log" id="pw-chat-log" role="log" aria-live="polite"></div>
        <div class="pw-chat-chips" id="pw-chat-chips" hidden>
          <button type="button" data-pw-ask="Where is order PW-4821?">Where is order PW-4821?</button>
          <button type="button" data-pw-ask="What sizes do you have?">What sizes do you have?</button>
          <button type="button" data-pw-ask="Can I personalize this?">Can I personalize this?</button>
        </div>
        <form class="pw-chat-form" id="pw-chat-form">
          <label class="sr-only" for="pw-chat-input" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Your message</label>
          <input id="pw-chat-input" type="text" autocomplete="off" placeholder="Ask about an order, a size, or a wrap" />
          <button class="pw-chat-send" type="submit" id="pw-chat-send">Send</button>
        </form>
        <p class="pw-chat-note" id="pw-chat-note">Scripted preview. Nothing leaves this page.</p>
      </div>
      <button type="button" class="pw-chat-toggle" id="pw-chat-toggle" aria-expanded="false" aria-controls="pw-chat-panel">
        Ask about a tumbler
      </button>
    `;
    document.body.appendChild(root);
  }

  loadCss();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  function start() {
    mount();
    bind();
  }

  function bind() {
    const panel = document.getElementById("pw-chat-panel");
    const toggle = document.getElementById("pw-chat-toggle");
    const chatLog = document.getElementById("pw-chat-log");
    const chatInput = document.getElementById("pw-chat-input");
    const chatForm = document.getElementById("pw-chat-form");
    const chatSend = document.getElementById("pw-chat-send");
    const chatNote = document.getElementById("pw-chat-note");
    const chips = document.getElementById("pw-chat-chips");
    const closeBtn = document.getElementById("pw-chat-close");

    let greeted = false;
    let dismissed = false;
    let userMessages = 0;
    let stockChecks = 0;
    let locked = false;

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
      el.className = `pw-chat-bubble ${who}`;
      el.textContent = text;
      chatLog.appendChild(el);
      chatLog.scrollTop = chatLog.scrollHeight;
      return el;
    }

    function addCta() {
      const el = document.createElement("p");
      el.className = "pw-chat-bubble bot cta";
      el.innerHTML = ctaHtml();
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

    function wantsPersonalize(message) {
      return /personaliz|monogram|engrav|etch|name on|add (a |my )?name|put (a |my )?name|a name or phrase/i.test(
        message
      );
    }

    function wantsCustom(message) {
      return /custom|one[- ]of[- ]a[- ]kind|my (own )?design|full (custom|design)|photo wrap|from scratch/i.test(
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
        return `${product.title} (${product.sku}, ${product.size}) — sample stock is ${product.stockLabel}. That’s a canned number for this demo, not a live count.`;
      }
      const lines = PRODUCTS.map(
        (item) => `${item.title}: ${item.stock} ${item.stock === 1 ? "left" : "in stock"}`
      );
      return `Sample shelf for this preview — ${lines.join("; ")}. Ask about a specific wrap if you want the SKU.`;
    }

    function personalizeReply(product) {
      if (product) {
        if (product.personalizable) {
          return `${product.title} has a personalization option — a first name or a short phrase. We don’t take full custom designs.`;
        }
        return `${product.title} ships as designed. We offer personalization on select listings, not full custom design. Meadow Speckle is the one that can take a name or short phrase.`;
      }
      return "We offer personalization on select listings, not full custom design. In this preview, Meadow Speckle (30 oz) can take a name or short phrase. Midnight Wrap and Copper Canyon ship as designed.";
    }

    function wrapCatalog() {
      return "This preview has three full-wrap designs: Midnight Wrap (20 oz, deep navy), Meadow Speckle (30 oz, sage speckle — personalization available), and Copper Canyon (20 oz, warm copper). A wrap is the printed design around the steel tumbler — edge to edge, not a small sticker.";
    }

    function replyTo(message) {
      if (
        /software|backend|app|saas|api|code base|developer/i.test(message) &&
        !/wrap|tumbler|cup|order/i.test(message)
      ) {
        return "I only help PrattWorks shoppers with tumblers and shop orders — not software. If you want a chatbot like this on your own site, that’s a CJ Code project.";
      }

      if (
        /\b(pw[-\s]?\d{3,6})\b/i.test(message) ||
        /order\s*(status|number|#|id)|where('?s| is) my order|track(ing)? (my )?order/i.test(message)
      ) {
        return orderReply(message);
      }

      const product = findProduct(message);
      const stock = wantsStock(message);
      const personalize = wantsPersonalize(message);
      const custom = wantsCustom(message);

      if (custom && !personalize) {
        return personalizeReply(product);
      }

      if (stock && personalize && product) {
        const extra = personalizeReply(product);
        if (stockChecks >= MAX_STOCK_CHECKS) {
          return `${extra} I’ve already used the sample stock checks in this preview.`;
        }
        return `${stockReply(product)} ${extra}`;
      }

      if (stock) return stockReply(product);
      if (personalize) return personalizeReply(product);

      if (/care|wash|dishwasher|microwave|clean|fade|scratch/i.test(message)) {
        return "Once a tumbler is engraved or personalized, you can wash it as usual. No special care routine.";
      }

      if (/size|oz\b|ounce|20|30|how big|sizing|which size/i.test(message)) {
        return "Two sizes in this shop: 20 oz for Midnight Wrap and Copper Canyon, 30 oz for Meadow Speckle.";
      }

      if (
        /what wraps|which wraps|what designs|catalog|what do you (sell|have|make)|tell me about (the )?(wraps|tumblers)|what('?s| is) a wrap|full wrap/i.test(
          message
        )
      ) {
        return wrapCatalog();
      }

      if (/ship|process|lead time|how long|when (will|does)|arrive|pack|transit|handmade/i.test(message)) {
        return "This preview doesn’t quote shipping times. I can look up a sample order — try PW-4821 — or email the shop about a live order.";
      }

      if (product) {
        const extra = product.personalizable
          ? "This listing has a personalization option (name or short phrase)."
          : "This one ships as designed — no personalization on this listing.";
        return `${product.title} is a ${product.size} full wrap, ${product.price}. SKU ${product.sku}. ${product.blurb} ${extra}`;
      }

      if (/price|cost|how much|\$/i.test(message)) {
        return "Midnight Wrap and Copper Canyon are $38 (20 oz). Meadow Speckle is $46 (30 oz) and has a personalization option. This preview doesn’t take payment.";
      }

      if (/hello|hi\b|hey|help|what can you/i.test(message)) {
        return "Ask about an order, tumbler sizes, or the wraps in the shop. I have one sample order: PW-4821.";
      }

      return "I can look up a sample order (PW-4821), tumbler sizes, or the wraps in this preview — Midnight, Meadow Speckle, and Copper Canyon. Try a chip, or name a wrap.";
    }

    function openChat() {
      panel.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
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
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
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

    toggle.addEventListener("click", () => {
      if (panel.hasAttribute("hidden")) openChat();
      else closeChat();
    });

    closeBtn.addEventListener("click", closeChat);

    chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      sendMessage(chatInput.value);
    });

    chips.querySelectorAll("[data-pw-ask]").forEach((btn) => {
      btn.addEventListener("click", () => {
        sendMessage(btn.getAttribute("data-pw-ask") || "");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hasAttribute("hidden")) closeChat();
    });

    document.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-ask]");
      if (!btn || btn.closest(".pw-chat")) return;
      openChat();
      sendMessage(btn.getAttribute("data-ask") || "");
    });

    updateNote();

    window.PrattWorksChat = {
      _ready: true,
      open: openChat,
      close: closeChat,
      ask(text) {
        openChat();
        sendMessage(text);
      },
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 901px)").matches;
    if (cfg.autoOpenDesktop && wide) {
      window.setTimeout(() => {
        if (!dismissed) openChat();
      }, reduceMotion ? 0 : 700);
    }
  }
})();
