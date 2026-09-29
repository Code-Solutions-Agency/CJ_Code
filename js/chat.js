import { answerFromKnowledge } from "./faq.js";

const GREETING =
  "I’m the CJ Code assistant — not a person. Ask about design, redesign, automation, maintenance, custom AI work, starting prices, or booking a call.";

const API_TIMEOUT_MS = 8000;
const MAX_MESSAGE = 500;
const HISTORY_TURNS = 6;

function $(id) {
  return document.getElementById(id);
}

const panel = $("chat-panel");
const chatToggle = $("chat-toggle");
const chatLog = $("chat-log");
const chatForm = $("chat-form");
const chatInput = $("chat-input");
const chatClose = $("chat-close");

if (!panel || !chatToggle || !chatLog || !chatForm || !chatInput) {
  /* Chat markup not on this page. */
} else {
  const history = [];
  let greeted = false;
  let pending = false;

  function addBubble(text, who) {
    const el = document.createElement("p");
    el.className = `chat-bubble ${who}`;
    el.textContent = text;
    chatLog.appendChild(el);
    chatLog.scrollTop = chatLog.scrollHeight;
    return el;
  }

  function setPending(isPending) {
    pending = isPending;
    const send = chatForm.querySelector('button[type="submit"]');
    chatInput.disabled = isPending;
    if (send) send.disabled = isPending;
  }

  async function answerViaApi(message) {
    if (window.location.protocol === "file:") return null;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: history.slice(-HISTORY_TURNS),
        }),
        signal: controller.signal,
      });
      if (!res.ok) return null;
      const data = await res.json();
      const text = String(data && data.answer ? data.answer : "").trim();
      return text || null;
    } catch {
      return null;
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function replyTo(message) {
    const api = await answerViaApi(message);
    if (api) return api;
    return answerFromKnowledge(message).answer;
  }

  function openChat() {
    panel.removeAttribute("hidden");
    chatToggle.setAttribute("aria-expanded", "true");
    if (!greeted) {
      addBubble(GREETING, "bot");
      greeted = true;
    }
    chatInput.focus();
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
    if (event.key !== "Escape" || !panel || panel.hasAttribute("hidden")) return;
    if (document.body.classList.contains("lightbox-open")) return;
    closeChat();
  });

  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (pending) return;
    const text = chatInput.value.trim().slice(0, MAX_MESSAGE);
    if (!text) return;
    addBubble(text, "user");
    history.push({ role: "user", content: text });
    chatInput.value = "";
    setPending(true);
    const waiting = addBubble("One moment…", "bot pending");
    try {
      const answer = await replyTo(text);
      waiting.textContent = answer;
      waiting.classList.remove("pending");
      history.push({ role: "assistant", content: answer });
    } catch {
      const fallback = answerFromKnowledge(text).answer;
      waiting.textContent = fallback;
      waiting.classList.remove("pending");
      history.push({ role: "assistant", content: fallback });
    } finally {
      setPending(false);
      chatInput.focus();
    }
  });
}
