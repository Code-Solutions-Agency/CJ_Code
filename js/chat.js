(() => {
  const SITE = window.SITE || {};
  const panel = document.getElementById("chat-panel");
  const chatToggle = document.getElementById("chat-toggle");
  const chatClose = document.getElementById("chat-close");
  const chatLog = document.getElementById("chat-log");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatNote = document.getElementById("chat-note");
  const chatLead = document.getElementById("chat-lead");
  const leadName = document.getElementById("chat-lead-name");
  const leadEmail = document.getElementById("chat-lead-email");
  const leadHoney = document.getElementById("chat-lead-honey");
  const leadSubmit = document.getElementById("chat-lead-submit");
  const leadStatus = document.getElementById("chat-lead-status");

  if (!panel || !chatToggle || !chatLog || !chatInput || !chatForm || !chatLead) return;

  const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const ON_CONTACT = /contact\.html$/i.test(window.location.pathname);
  const BOOK_HREF = ON_CONTACT ? "#contact" : "contact.html";
  const BOOK_LABEL = ON_CONTACT ? "Use the calendar on this page" : "Book a time on the Contact page";
  const CHAT_ENDPOINT = SITE.chatEndpoint || "/api/chat";
  const SESSION_KEY = "cjcode-chat-session";
  const VISITOR_KEY = "cjcode-chat-visitor";
  const NOTE_GATE = "We’ll follow up at this email if it’s a fit.";
  const NOTE_CHAT = "Ask about design, redesign, maintenance, automation, or chatbots.";

  const transcript = [];
  const history = [];
  let visitor = loadVisitor();
  let greeted = false;
  let pending = false;
  let abort = null;
  let requestGen = 0;

  function firstNameFrom(name) {
    const token = String(name || "")
      .trim()
      .split(/\s+/)
      .find(Boolean);
    return token ? token.slice(0, 40) : "";
  }

  function greetingFor(name) {
    const first = firstNameFrom(name);
    return first ? `Hi ${first}, how can I help you?` : "Hi, how can I help you?";
  }

  function loadVisitor() {
    try {
      const raw = sessionStorage.getItem(VISITOR_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && data.name && data.email) return data;
    } catch {
      /* ignore */
    }
    return null;
  }

  function saveVisitor(data) {
    visitor = { name: data.name, email: data.email, sent: Boolean(data.sent) };
    try {
      sessionStorage.setItem(VISITOR_KEY, JSON.stringify(visitor));
    } catch {
      /* ignore */
    }
  }

  function sessionId() {
    try {
      let id = sessionStorage.getItem(SESSION_KEY);
      if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem(SESSION_KEY, id);
      }
      return id;
    } catch {
      return "anon";
    }
  }

  function leadEndpoint() {
    if (SITE.leadEndpoint) return SITE.leadEndpoint;
    const local = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
    if (local) return `${window.location.origin}/api/lead`;
    if (!SITE.contactEmail) return "";
    return `https://formsubmit.co/ajax/${encodeURIComponent(SITE.contactEmail)}`;
  }

  function transcriptText() {
    return transcript
      .slice(-12)
      .map((entry) => `${entry.who === "user" ? "Visitor" : "CJ Code"}: ${entry.text}`)
      .join("\n");
  }

  function mailtoLead({ name, email }) {
    const subject = `Chat lead — ${name}`;
    let body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Page: ${window.location.href}`,
      "",
      "Chat:",
      transcriptText() || "(no messages yet — opened the assistant)",
    ].join("\n");
    if (body.length > 1800) body = `${body.slice(0, 1800)}\n…`;
    return `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function scrollChat() {
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function linkify(container, text) {
    const pattern =
      /(contact\.html(?:#[\w-]+)?|https?:\/\/[^\s<]+|mailto:hello@cjcode\.com)/gi;
    let last = 0;
    let match;
    const source = String(text);
    while ((match = pattern.exec(source))) {
      if (match.index > last) {
        container.appendChild(document.createTextNode(source.slice(last, match.index)));
      }
      const raw = match[0];
      const link = document.createElement("a");
      if (/^contact\.html/i.test(raw)) {
        link.href = ON_CONTACT ? "#contact" : raw;
        link.textContent = ON_CONTACT ? "this page" : "the Contact page";
      } else {
        link.href = raw;
        if (/^https?:/i.test(raw)) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
        link.textContent = /^mailto:/i.test(raw) ? "hello@cjcode.com" : raw;
      }
      container.appendChild(link);
      last = match.index + raw.length;
    }
    if (last < source.length) {
      container.appendChild(document.createTextNode(source.slice(last)));
    }
  }

  function addBubble(text, who) {
    const el = document.createElement("p");
    el.className = `chat-bubble ${who}`;
    if (who === "bot") linkify(el, text);
    else el.textContent = text;
    chatLog.appendChild(el);
    transcript.push({ who, text });
    scrollChat();
    return el;
  }

  function addRichBubble(who, build) {
    const el = document.createElement("p");
    el.className = `chat-bubble ${who}`;
    build(el);
    chatLog.appendChild(el);
    scrollChat();
    return el;
  }

  function setTyping(on) {
    const existing = chatLog.querySelector(".chat-typing");
    if (existing) existing.remove();
    if (!on) return;
    const el = document.createElement("p");
    el.className = "chat-bubble bot chat-typing";
    el.setAttribute("aria-label", "Assistant is typing");
    el.innerHTML = "<span></span><span></span><span></span>";
    chatLog.appendChild(el);
    scrollChat();
  }

  function showGate() {
    panel.classList.add("is-gate");
    panel.classList.remove("is-chat");
    chatLead.removeAttribute("hidden");
    chatLog.setAttribute("hidden", "");
    chatForm.setAttribute("hidden", "");
    if (chatNote) chatNote.textContent = NOTE_GATE;
  }

  function showChat() {
    panel.classList.remove("is-gate");
    panel.classList.add("is-chat");
    chatLead.setAttribute("hidden", "");
    chatLog.removeAttribute("hidden");
    chatForm.removeAttribute("hidden");
    if (chatNote) chatNote.textContent = NOTE_CHAT;
  }

  function startConversation() {
    showChat();
    if (!greeted && visitor) {
      const text = greetingFor(visitor.name);
      addBubble(text, "bot");
      history.push({ role: "assistant", content: text });
      greeted = true;
    }
    chatInput.focus();
  }

  function isLeadSuccess(response, data) {
    if (!response.ok) return false;
    if (!data || typeof data !== "object") return true;
    if (data.success === false || data.success === "false") return false;
    return true;
  }

  async function sendLead(payload) {
    if (payload.honey) return { ok: true, honey: true };
    const endpoint = leadEndpoint();
    if (!endpoint) throw new Error("no endpoint");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        page: window.location.href,
        _subject: `Chat lead from ${SITE.name || "CJ Code"} site — ${payload.name}`,
        _template: "table",
        _captcha: "false",
        _honey: "",
      }),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!isLeadSuccess(response, data)) {
      throw new Error(data && data.message ? String(data.message) : `HTTP ${response.status}`);
    }
    return { ok: true };
  }

  async function requestReply() {
    if (!visitor) return;
    if (abort) abort.abort();
    abort = new AbortController();
    const gen = ++requestGen;
    pending = true;
    chatInput.disabled = true;
    setTyping(true);

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.signal,
        body: JSON.stringify({
          messages: history,
          sessionId: sessionId(),
          leadCaptured: true,
          visitorName: visitor.name,
          page: ON_CONTACT ? "contact" : "home",
        }),
      });

      if (gen !== requestGen) return;

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      setTyping(false);

      if (response.status === 429) {
        addBubble(
          (data && data.error) ||
            "Too many messages. Try again in a few minutes, or email hello@cjcode.com.",
          "bot"
        );
        return;
      }

      if (!response.ok || !data || !data.reply) {
        addRichBubble("bot", (el) => {
          el.append(
            document.createTextNode(
              (data && data.error) ||
                "The assistant is unavailable right now. Email hello@cjcode.com or "
            )
          );
          if (!(data && data.error)) {
            const link = document.createElement("a");
            link.href = BOOK_HREF;
            link.textContent = BOOK_LABEL.toLowerCase();
            el.append(link);
            el.append(document.createTextNode("."));
          }
        });
        return;
      }

      addBubble(data.reply, "bot");
      history.push({ role: "assistant", content: data.reply });
    } catch (err) {
      if (err && err.name === "AbortError") return;
      if (gen !== requestGen) return;
      setTyping(false);
      addRichBubble("bot", (el) => {
        el.append(document.createTextNode("Couldn’t reach the assistant. "));
        const link = document.createElement("a");
        link.href = BOOK_HREF;
        link.textContent = BOOK_LABEL;
        el.append(link);
        el.append(document.createTextNode(", or email hello@cjcode.com."));
      });
    } finally {
      if (gen !== requestGen) return;
      pending = false;
      chatInput.disabled = false;
      if (!panel.hasAttribute("hidden") && visitor) chatInput.focus();
    }
  }

  function openChat() {
    panel.removeAttribute("hidden");
    chatToggle.setAttribute("aria-expanded", "true");
    if (visitor) startConversation();
    else {
      showGate();
      if (leadName) leadName.focus();
    }
  }

  function closeChat(event) {
    if (event) event.stopPropagation();
    panel.setAttribute("hidden", "");
    chatToggle.setAttribute("aria-expanded", "false");
    chatToggle.focus();
  }

  chatToggle.addEventListener("click", () => {
    if (panel.hasAttribute("hidden")) openChat();
    else closeChat();
  });

  if (chatClose) chatClose.addEventListener("click", closeChat);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (document.body.classList.contains("lightbox-open")) return;
    if (!panel.hasAttribute("hidden")) closeChat();
  });

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!visitor || pending) return;
    const text = chatInput.value.trim();
    if (!text) return;
    addBubble(text, "user");
    history.push({ role: "user", content: text });
    chatInput.value = "";
    requestReply();
  });

  chatLead.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (visitor && visitor.sent) {
      startConversation();
      return;
    }

    const name = (leadName && leadName.value.trim()) || "";
    const email = (leadEmail && leadEmail.value.trim()) || "";
    const honey = (leadHoney && leadHoney.value.trim()) || "";

    if (!name) {
      if (leadStatus) leadStatus.textContent = "Name is required.";
      leadName?.focus();
      return;
    }
    if (!email || !EMAIL_RX.test(email)) {
      if (leadStatus) leadStatus.textContent = "A valid email is required.";
      leadEmail?.focus();
      return;
    }

    if (leadStatus) leadStatus.textContent = "Starting…";
    if (leadSubmit) leadSubmit.disabled = true;

    const payload = { name, email, honey };
    let sent = Boolean(visitor && visitor.sent);

    try {
      if (!sent) await sendLead(payload);
      sent = true;
    } catch {
      if (leadStatus) {
        leadStatus.textContent = "";
        leadStatus.append(document.createTextNode("Couldn’t email from here. "));
        const link = document.createElement("a");
        link.href = mailtoLead(payload);
        link.textContent = `Open a draft to ${SITE.contactEmail}`;
        leadStatus.append(link);
        leadStatus.append(document.createTextNode(". Starting the assistant anyway."));
      }
    }

    saveVisitor({ name, email, sent });
    if (leadSubmit) leadSubmit.disabled = false;
    if (leadStatus) {
      window.setTimeout(() => {
        if (leadStatus.textContent.startsWith("Starting")) leadStatus.textContent = "";
      }, 400);
    }
    startConversation();
  });
})();
