/**
 * AI Business Email Assistant — portfolio demo only.
 *
 * Sample messages, a short generate cap, watermarked output, no clean copy.
 * This is not wired to a live model on purpose. Do not put API keys here.
 */
(() => {
  const form = document.getElementById("email-assistant-form");
  if (!form) return;

  const DEMO_ID = "email-assistant";
  const WATERMARK =
    "DEMO SAMPLE — not for sending to a customer. Production writes from your real inbox, in your voice.";

  const sampleEl = document.getElementById("email-sample");
  const messageEl = document.getElementById("email-customer-message");
  const typeEl = document.getElementById("email-response-type");
  const toneEl = document.getElementById("email-tone");
  const outputEl = document.getElementById("email-suggested-response");
  const statusEl = document.getElementById("email-assistant-status");
  const generateBtn = document.getElementById("email-generate");
  const lockEl = document.getElementById("email-demo-lock");
  const remainingEl = document.getElementById("email-demo-remaining");

  const SAMPLES = {
    appointment:
      "Hi, I need to move my Friday 2pm appointment to Monday morning if you have anything open.",
    complaint:
      "The order arrived two days late and the box was crushed. I need this replaced before Saturday.",
    question:
      "Do you offer the same service for commercial properties, or only residential?",
  };

  const TYPE_LABELS = {
    question: "Customer Question",
    complaint: "Customer Complaint",
    appointment: "Appointment Request",
    followup: "Follow-Up",
    thanks: "Thank You",
    general: "General Response",
  };

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text || "";
  }

  function greeting(tone) {
    if (tone === "friendly") return "Hi there,";
    if (tone === "warm") return "Hello,";
    if (tone === "concise") return "Hello,";
    return "Dear customer,";
  }

  function signoff(tone) {
    if (tone === "friendly") return "Happy to help,\nThe team";
    if (tone === "warm") return "With appreciation,\nThe team";
    if (tone === "concise") return "Best,\nThe team";
    return "Kind regards,\nThe team";
  }

  function snippet(message) {
    const clean = (message || "").replace(/\s+/g, " ").trim();
    if (!clean) return "your request";
    const clipped = clean.length > 110 ? `${clean.slice(0, 107)}…` : clean;
    return clipped;
  }

  function bodyFor(type, tone, message) {
    const note = snippet(message);
    const extra =
      tone === "concise"
        ? ""
        : tone === "warm"
          ? " We want this to feel easy on your side."
          : tone === "friendly"
            ? " Thanks for reaching out — we’ll take it from here."
            : " Please reply if anything here needs a correction.";

    const bodies = {
      question: `Thank you for the question. You wrote: “${note}”\n\nHere’s the clear next step: we’ll confirm the details and send you a direct answer. If we need anything else, we’ll ask in one follow-up.${extra}`,
      complaint: `I’m sorry this didn’t go the way it should have. You wrote: “${note}”\n\nWe’re looking into this now and will make it right. If you have a preferred fix (reschedule, refund, or a callback), tell us and we’ll prioritize it.${extra}`,
      appointment: `Happy to help with scheduling. You wrote: “${note}”\n\nWe can move this as requested, pending the next open slot. Reply yes to lock it in, or send two other times that work and we’ll confirm.${extra}`,
      followup: `Just checking in on this. You wrote: “${note}”\n\nIf this is still open, we can finish it on this thread. If it’s already resolved, a quick “all set” is enough and we’ll close it out.${extra}`,
      thanks: `Thank you — that note means a lot. You wrote: “${note}”\n\nWe’re glad we could help, and you’re welcome to come back anytime with a question or a new request.${extra}`,
      general: `Thanks for the message. You wrote: “${note}”\n\nWe’ve got it, and we’ll follow up with a clear next step. If there’s a deadline on your side, include it and we’ll work to that.${extra}`,
    };

    return bodies[type] || bodies.general;
  }

  function generateDemoResponse({ message, type, tone }) {
    return `${WATERMARK}\n\n${greeting(tone)}\n\n${bodyFor(type, tone, message)}\n\n${signoff(tone)}`;
  }

  function fillSample() {
    const key = sampleEl.value;
    messageEl.value = SAMPLES[key] || SAMPLES.appointment;
    if (TYPE_LABELS[key]) typeEl.value = key;
  }

  function updateRemainingLabel() {
    const left = window.DemoUses.remaining(DEMO_ID);
    const max = window.DemoUses.maxUses();
    if (remainingEl) {
      remainingEl.textContent =
        left > 0 ? `${left} of ${max} demo replies left` : "Demo replies used";
    }
  }

  function setLocked(locked) {
    form.classList.toggle("is-demo-locked", locked);
    generateBtn.disabled = locked;
    sampleEl.disabled = locked;
    typeEl.disabled = locked;
    toneEl.disabled = locked;
    if (lockEl) lockEl.hidden = !locked;
    if (locked) {
      setStatus("Demo limit reached for this browser.");
    }
    updateRemainingLabel();
  }

  function syncLock() {
    setLocked(window.DemoUses.remaining(DEMO_ID) <= 0);
  }

  async function generateResponse() {
    if (window.DemoUses.remaining(DEMO_ID) <= 0) {
      setLocked(true);
      return;
    }

    const message = messageEl.value.trim();
    const type = typeEl.value;
    const tone = toneEl.value;

    generateBtn.disabled = true;
    setStatus("Writing a sample reply…");
    outputEl.value = "";

    await new Promise((resolve) => window.setTimeout(resolve, 280));

    if (!window.DemoUses.consume(DEMO_ID)) {
      setLocked(true);
      return;
    }

    outputEl.value = generateDemoResponse({ message, type, tone });
    setStatus(`Sample reply · ${TYPE_LABELS[type] || type} · ${tone}`);
    syncLock();
    if (window.DemoUses.remaining(DEMO_ID) > 0) generateBtn.disabled = false;
  }

  sampleEl.addEventListener("change", fillSample);
  fillSample();
  syncLock();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    generateResponse();
  });
})();
