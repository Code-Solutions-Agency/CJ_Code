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
  const chatHandoff = document.getElementById("chat-handoff");
  const chatToolbar = document.getElementById("chat-toolbar");
  const leadName = document.getElementById("chat-lead-name");
  const leadEmail = document.getElementById("chat-lead-email");
  const leadNote = document.getElementById("chat-lead-note");
  const leadHoney = document.getElementById("chat-lead-honey");
  const leadSubmit = document.getElementById("chat-lead-submit");
  const leadCancel = document.getElementById("chat-lead-cancel");
  const leadStatus = document.getElementById("chat-lead-status");

  if (!panel || !chatToggle || !chatLog || !chatInput || !chatForm) return;

  const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const ON_CONTACT = /contact\.html$/i.test(window.location.pathname);
  const BOOK_HREF = ON_CONTACT ? "#contact" : "contact.html";
  const BOOK_LABEL = ON_CONTACT ? "Use the calendar on this page" : "Book a time on the Contact page";
  const CHAT_ENDPOINT = SITE.chatEndpoint || "/api/chat";
  const SESSION_KEY = "cjcode-chat-session";
  const GREETING =
    "Hi — I can help with CJ Code websites and AI work. Ask about design, redesign, maintenance, automation, or chatbots. If it looks like a fit, leave your details or book a call.";

  const transcript = [];
  const history = [];
  let greeted = false;
  let leadSent = false;
  let leadPrompted = false;
  let pending = false;
  let abort = null;
  let requestGen = 0;

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
    if (!SITE.contactEmail) return "";
    return `https://formsubmit.co/ajax/${encodeURIComponent(SITE.contactEmail)}`;
  }

  function transcriptText() {
    return transcript
      .slice(-12)
      .map((entry) => `${entry.who === "user" ? "Visitor" : "CJ Code"}: ${entry.text}`)
      .join("\n");
  }

  function mailtoLead({ name, email, note }) {
    const subject = `Chat lead — ${name}`;
    let body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Note: ${note || "—"}`,
      `Page: ${window.location.href}`,
      "",
      "Chat:",
      transcriptText() || "(no messages yet)",
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
        link.href = ON_CONTACT ? raw.replace(/^contact\.html/i, "") || "#contact" : raw;
      } else {
        link.href = raw;
        if (/^https?:/i.test(raw)) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
      }
      link.textContent = /^mailto:/i.test(raw) ? "hello@cjcode.com" : raw;
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

  function setLeadOpen(open) {
    if (!chatLead || leadSent) return;
    if (open) chatLead.removeAttribute("hidden");
    else chatLead.setAttribute("hidden", "");
    if (chatHandoff) chatHandoff.setAttribute("aria-expanded", open ? "true" : "false");
    if (chatToolbar) chatToolbar.hidden = open;
    if (open && leadName) window.setTimeout(() => leadName.focus(), 0);
    scrollChat();
  }

  function maybeOfferLead(suggest) {
    if (!suggest || leadSent || leadPrompted) return;
    leadPrompted = true;
    setLeadOpen(true);
  }

  function showThanks(email) {
    addRichBubble("bot", (el) => {
      el.append(
        document.createTextNode(
          email
            ? `Thanks — we have that. We’ll follow up at ${email}. `
            : "Thanks — we have your details. "
        )
      );
      const link = document.createElement("a");
      link.href = BOOK_HREF;
      link.textContent = BOOK_LABEL;
      el.append(link);
      el.append(document.createTextNode(" if you’d rather pick a slot now. You can keep asking questions here."));
    });
    if (chatNote) {
      chatNote.textContent = "We received your note. Ask anything else about the work.";
    }
    if (chatToolbar) chatToolbar.hidden = true;
  }

  function showFallback(payload) {
    const href = mailtoLead(payload);
    addRichBubble("bot", (el) => {
      el.append(document.createTextNode("Couldn’t send from the browser. "));
      const link = document.createElement("a");
      link.href = href;
      link.textContent = `Open an email draft to ${SITE.contactEmail}`;
      el.append(link);
      el.append(document.createTextNode(" with this note instead — you can also try Send again."));
    });
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
        note: payload.note || "(none)",
        page: window.location.href,
        transcript: transcriptText() || "(no messages yet)",
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
          leadCaptured: leadSent,
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
        const text =
          (data && data.error) ||
          "Too many messages. Try again in a few minutes, or email hello@cjcode.com.";
        addBubble(text, "bot");
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
      maybeOfferLead(data.suggestLead);
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
      if (!panel.hasAttribute("hidden")) chatInput.focus();
    }
  }

  function openChat() {
    panel.removeAttribute("hidden");
    chatToggle.setAttribute("aria-expanded", "true");
    if (!greeted) {
      addBubble(GREETING, "bot");
      history.push({ role: "assistant", content: GREETING });
      greeted = true;
    }
    const focusLead = chatLead && !chatLead.hasAttribute("hidden") && leadName;
    if (focusLead) leadName.focus();
    else chatInput.focus();
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
    if (pending) return;
    const text = chatInput.value.trim();
    if (!text) return;
    addBubble(text, "user");
    history.push({ role: "user", content: text });
    chatInput.value = "";
    requestReply();
  });

  if (chatHandoff) {
    chatHandoff.addEventListener("click", () => {
      if (!greeted) {
        addBubble(GREETING, "bot");
        history.push({ role: "assistant", content: GREETING });
        greeted = true;
      }
      leadPrompted = true;
      const wasHidden = Boolean(chatLead && chatLead.hasAttribute("hidden"));
      if (wasHidden && !leadSent) {
        addBubble("Share your name and email below and we’ll follow up.", "bot");
      }
      setLeadOpen(true);
    });
  }

  if (leadCancel) {
    leadCancel.addEventListener("click", () => {
      setLeadOpen(false);
      chatInput.focus();
    });
  }

  if (chatLead) {
    chatLead.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (leadSent) return;

      const name = (leadName && leadName.value.trim()) || "";
      const email = (leadEmail && leadEmail.value.trim()) || "";
      const note = (leadNote && leadNote.value.trim()) || "";
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

      const payload = { name, email, note, honey };
      if (leadStatus) leadStatus.textContent = "Sending…";
      if (leadSubmit) leadSubmit.disabled = true;

      try {
        await sendLead(payload);
        leadSent = true;
        setLeadOpen(false);
        if (chatLead) chatLead.setAttribute("hidden", "");
        if (leadStatus) leadStatus.textContent = "";
        showThanks(email);
      } catch {
        if (leadStatus) {
          leadStatus.textContent = "Couldn’t send from here. Use the email draft in the chat.";
        }
        showFallback(payload);
      } finally {
        if (leadSubmit) leadSubmit.disabled = false;
      }
    });
  }
})();
