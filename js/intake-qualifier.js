/**
 * Project intake qualifier — portfolio demo only.
 *
 * Sample inbound requests, a short generate cap, watermarked brief, no clean copy.
 * This is a walkthrough of the product, not a free briefing tool.
 */
(() => {
  const form = document.getElementById("intake-qualifier-form");
  if (!form) return;

  const DEMO_ID = "intake-qualifier";
  const WATERMARK =
    "DEMO SAMPLE — not a live project brief. Production turns your real inbound into a brief your team can work from.";

  const sampleEl = document.getElementById("intake-sample");
  const requestEl = document.getElementById("intake-request");
  const depthEl = document.getElementById("intake-depth");
  const outputEl = document.getElementById("intake-brief");
  const statusEl = document.getElementById("intake-status");
  const generateBtn = document.getElementById("intake-generate");
  const lockEl = document.getElementById("intake-demo-lock");
  const remainingEl = document.getElementById("intake-demo-remaining");

  const SAMPLES = {
    harbor: {
      label: "Harbor & Line — site + qualifier",
      request:
        "We’re an agency. The marketing site is outdated and inbound is a mess. We need a rebuild (about six pages) and something on Contact that qualifies fit, timeline, and budget before it hits the PM. We don’t want another chatbot toy — it has to land in the same place the team already works.",
      brief(depth) {
        const extra =
          depth === "full"
            ? [
                "",
                "Open questions for kickoff",
                "• Who answers the qualifier after hours, and what is the handoff SLA?",
                "• Brand files: current type, color, photography rights.",
                "• CMS preference (keep, replace, or static).",
                "• Which inbox or board should qualified leads land in?",
              ]
            : [];
        return [
          "Client: Harbor & Line",
          "Fit: Agency marketing site + intake, not a net-new product.",
          "Need: Rebuild ~6 pages and qualify Contact before it reaches the PM.",
          "Pages: Home, Work, Services, About, Contact, plus one case-study template.",
          "AI: Qualifier on Contact — budget range, timeline, fit — then a structured note to the PM.",
          "Out of scope (unless added): CRM rebuild, paid ads, ongoing content retainers.",
          "Suggested next step: 30-minute kickoff with the PM and whoever owns the current site.",
          ...extra,
        ].join("\n");
      },
    },
    kindling: {
      label: "Kindling Coffee — one-pager + FAQ",
      request:
        "We need a simple one-page site for the shop and an after-hours FAQ so people stop DMing about hours, catering, and whether we have oat milk. We’re not trying to sell online. Just look current and answer the same five questions without a person.",
      brief(depth) {
        const extra =
          depth === "full"
            ? [
                "",
                "Open questions for kickoff",
                "• Source of truth for hours (Google, Instagram, or the site).",
                "• Catering: who confirms, and what is the minimum notice?",
                "• Photos: existing, or a short on-site set.",
              ]
            : [];
        return [
          "Client: Kindling Coffee",
          "Fit: Small local business, one surface, high repeat questions.",
          "Need: One-page site plus after-hours FAQ answers on the same page.",
          "Pages: Single scroll — story, hours, menu highlights, catering, contact.",
          "AI: FAQ assistant trained on hours, milk options, catering, location. No checkout.",
          "Out of scope (unless added): Ecommerce, loyalty, delivery integrations.",
          "Suggested next step: Collect the five answers they already type into DMs.",
          ...extra,
        ].join("\n");
      },
    },
    northline: {
      label: "Northline — inbound to a usable brief",
      request:
        "Our PMs spend half the morning turning ‘we need a website’ emails into something the designers can estimate. Can intake read those messages and spit out pages, goals, timeline, and what’s missing — then drop that into the project board?",
      brief(depth) {
        const extra =
          depth === "full"
            ? [
                "",
                "Open questions for kickoff",
                "• Where do inbound emails live today (shared inbox, form, both)?",
                "• Board destination: new card, comment on an existing lead, or email only?",
                "• What must be present before a designer will estimate (pages, brand, deadline)?",
              ]
            : [];
        return [
          "Client: Northline",
          "Fit: Internal ops for an agency that already has designers — intake is the bottleneck.",
          "Need: Turn messy ‘we need a website’ mail into a structured brief on the project board.",
          "Capture: Pages requested, primary goal, timeline, budget signal, missing assets.",
          "AI: Draft brief + a short list of questions the PM still has to ask. Human sends it.",
          "Out of scope (unless added): Auto-quoting, contracts, designer assignment.",
          "Suggested next step: Shadow ten real inbound threads and mark what the PM always has to add.",
          ...extra,
        ].join("\n");
      },
    },
  };

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text || "";
  }

  function fillSample() {
    const sample = SAMPLES[sampleEl.value] || SAMPLES.harbor;
    requestEl.value = sample.request;
  }

  function updateRemainingLabel() {
    const left = window.DemoUses.remaining(DEMO_ID);
    const max = window.DemoUses.maxUses();
    if (remainingEl) {
      remainingEl.textContent =
        left > 0 ? `${left} of ${max} demo briefs left` : "Demo briefs used";
    }
  }

  function setLocked(locked) {
    form.classList.toggle("is-demo-locked", locked);
    generateBtn.disabled = locked;
    sampleEl.disabled = locked;
    depthEl.disabled = locked;
    if (lockEl) lockEl.hidden = !locked;
    if (locked) {
      setStatus("Demo limit reached for this browser.");
    }
    updateRemainingLabel();
  }

  function syncLock() {
    setLocked(window.DemoUses.remaining(DEMO_ID) <= 0);
  }

  async function generateBrief() {
    if (window.DemoUses.remaining(DEMO_ID) <= 0) {
      setLocked(true);
      return;
    }

    const sample = SAMPLES[sampleEl.value] || SAMPLES.harbor;
    const depth = depthEl.value;

    generateBtn.disabled = true;
    setStatus("Drafting a sample brief…");
    outputEl.value = "";

    await new Promise((resolve) => window.setTimeout(resolve, 280));

    if (!window.DemoUses.consume(DEMO_ID)) {
      setLocked(true);
      return;
    }

    outputEl.value = `${WATERMARK}\n\n${sample.brief(depth)}`;
    setStatus(`Sample brief · ${sample.label.split("—")[0].trim()}`);
    syncLock();
    if (window.DemoUses.remaining(DEMO_ID) > 0) generateBtn.disabled = false;
  }

  sampleEl.addEventListener("change", fillSample);
  fillSample();
  syncLock();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    generateBrief();
  });
})();
