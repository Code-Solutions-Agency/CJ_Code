(() => {
  const SITE = window.SITE || {
    name: "CJ Code",
    contactEmail: "hello@cjcode.com",
  };
  const PROJECTS = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];

  function isReload() {
    try {
      const nav = performance.getEntriesByType("navigation")[0];
      if (nav && nav.type) return nav.type === "reload";
    } catch {
      /* ignore */
    }
    return false;
  }

  function pinTopIfNeeded() {
    const honorHash = Boolean(window.location.hash) && !isReload();
    if (honorHash) return;

    if (window.location.hash) {
      try {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch {
        /* file:// may ignore this */
      }
    }

    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previous;
  }

  pinTopIfNeeded();
  window.addEventListener("load", pinTopIfNeeded);
  window.addEventListener("pageshow", pinTopIfNeeded);

  const $ = (id) => document.getElementById(id);

  /* Header + nav */
  const header = $("site-header");
  const nav = $("site-nav");
  const toggle = $("nav-toggle");
  const navLinks = [...nav.querySelectorAll("a")];

  function setNavOpen(open) {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  toggle.addEventListener("click", () => {
    setNavOpen(!document.body.classList.contains("nav-open"));
  });

  navLinks.forEach((link) => {
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

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 8);
  }, { passive: true });

  const sections = ["process", "work", "services", "pricing"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const onContactPage = /contact\.html$/i.test(window.location.pathname);
  if (onContactPage) {
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href.includes("contact.html")) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const match = link.getAttribute("href") === `#${entry.target.id}`;
          if (match) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  /* Reveal */
  const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (motionOk) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));
  } else {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("in-view"));
  }

  /* Work grid */
  function renderWork() {
    const grid = $("work-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const slotCount = 3;

    if (!PROJECTS.length) {
      const note = document.createElement("p");
      note.className = "work-empty-note";
      note.textContent = "Project examples will show up here as you add them in js/projects.js.";
      grid.appendChild(note);
      appendGhostCards(grid, slotCount);
      return;
    }

    PROJECTS.forEach((project) => {
      const hasVideo = Boolean(project.video);
      const hasDemo = Boolean(project.demo);
      const isHash = project.href === "#";
      const useLink = project.href && !isHash && !hasVideo && !hasDemo;
      const card = useLink ? document.createElement("a") : document.createElement("article");
      card.className = "work-card";
      if (hasVideo) card.classList.add("has-video");
      if (hasDemo) card.classList.add("has-demo");

      if (useLink) {
        card.href = project.href;
        if (/^https?:/i.test(project.href)) {
          card.target = "_blank";
          card.rel = "noopener noreferrer";
        }
      }

      const tags = Array.isArray(project.tags) ? project.tags : [];
      let media = `<div class="work-media"></div>`;
      if (hasVideo) {
        media = `<div class="work-media">
          <video src="${escapeAttr(project.video)}" muted loop playsinline preload="metadata" aria-hidden="true"></video>
          <span class="work-expand">Click to enlarge</span>
        </div>`;
      } else if (hasDemo) {
        const isIntake = project.demo === "intake-qualifier";
        media = `<div class="work-media work-preview">
          <div class="work-preview-app" aria-hidden="true">
            <p class="work-preview-label">${isIntake ? "Intake" : "Inbox"}</p>
            <p class="work-preview-line"></p>
            <p class="work-preview-line short"></p>
            <p class="work-preview-reply">${isIntake ? "Project brief" : "Suggested reply"}</p>
          </div>
          <span class="work-expand">Try Demo</span>
        </div>`;
      } else if (project.image) {
        media = `<div class="work-media"><img src="${escapeAttr(project.image)}" alt="" /></div>`;
      }

      card.innerHTML = `
        ${media}
        <div class="work-body">
          <p class="work-cat">${escapeHtml(project.category || "Project")}</p>
          <h3>${escapeHtml(project.title || "Untitled")}</h3>
          ${project.client ? `<p class="work-client">${escapeHtml(project.client)}</p>` : ""}
          <p class="work-summary">${escapeHtml(project.summary || "")}</p>
          ${
            tags.length
              ? `<p class="work-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</p>`
              : ""
          }
        </div>
      `;

      if (hasVideo) {
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute(
          "aria-label",
          `Enlarge video: ${project.title || "Project demo"}`
        );
        const open = () => openVideoLightbox(project);
        card.addEventListener("click", open);
        card.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        });
      } else if (project.demo === "email-assistant" || project.demo === "intake-qualifier") {
        const isIntake = project.demo === "intake-qualifier";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute(
          "aria-label",
          isIntake
            ? "Try Demo: Project intake qualifier"
            : "Try Demo: AI Business Email Assistant"
        );
        const open = isIntake ? openIntakeQualifier : openEmailAssistant;
        card.addEventListener("click", open);
        card.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        });
      }

      grid.appendChild(card);
    });

    const remaining = Math.max(0, slotCount - PROJECTS.length);
    if (remaining) appendGhostCards(grid, remaining);

    setupCardVideos();
    pinTopIfNeeded();
    window.requestAnimationFrame(pinTopIfNeeded);
  }

  function setupCardVideos() {
    const videos = document.querySelectorAll(".work-media video");
    if (!videos.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (!(video instanceof HTMLVideoElement)) return;
          if (entry.isIntersecting && !reduceMotion) video.play().catch(() => {});
          else video.pause();
        });
      },
      { threshold: 0.35 }
    );

    videos.forEach((video) => observer.observe(video));
  }

  function appendGhostCards(grid, count) {
    for (let i = 0; i < count; i += 1) {
      const card = document.createElement("article");
      card.className = "ghost-card";
      card.setAttribute("aria-hidden", "true");
      card.innerHTML = `
        <div class="ghost-media"></div>
        <div class="ghost-body">
          <p class="ghost-cat"></p>
          <p class="ghost-title"></p>
          <p class="ghost-summary"></p>
        </div>
      `;
      grid.appendChild(card);
    }
  }

  /* Video lightbox */
  const lightbox = $("video-lightbox");
  const lightboxPlayer = $("video-lightbox-player");
  const lightboxTitle = $("video-lightbox-title");
  let lightboxReturnFocus = null;

  function setCardVideosPaused(paused) {
    document.querySelectorAll(".work-media video").forEach((video) => {
      if (paused) video.pause();
      else video.play().catch(() => {});
    });
  }

  function openVideoLightbox(project) {
    if (!project.video || !lightbox || !lightboxPlayer) return;
    lightboxReturnFocus = document.activeElement;
    lightboxTitle.textContent = project.title || "Project demo";
    lightboxPlayer.src = project.video;
    lightboxPlayer.currentTime = 0;
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    setCardVideosPaused(true);
    lightboxPlayer.play().catch(() => {});
    $("video-lightbox-close").focus();
  }

  function closeVideoLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    lightboxPlayer.pause();
    lightboxPlayer.removeAttribute("src");
    lightboxPlayer.load();
    setCardVideosPaused(false);
    if (lightboxReturnFocus && typeof lightboxReturnFocus.focus === "function") {
      lightboxReturnFocus.focus();
    }
  }

  if (lightbox && lightboxPlayer) {
    $("video-lightbox-close").addEventListener("click", closeVideoLightbox);
    lightbox.querySelectorAll("[data-lightbox-close]").forEach((el) => {
      el.addEventListener("click", closeVideoLightbox);
    });
  }

  /* Interactive demos */
  const emailModal = $("email-assistant-lightbox");
  const intakeModal = $("intake-qualifier-lightbox");
  let demoReturnFocus = null;

  function openDemoModal(modal, focusId) {
    if (!modal) return;
    demoReturnFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("lightbox-open");
    setCardVideosPaused(true);
    const first = $(focusId);
    if (first) first.focus();
  }

  function closeDemoModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("lightbox-open");
    setCardVideosPaused(false);
    if (demoReturnFocus && typeof demoReturnFocus.focus === "function") {
      demoReturnFocus.focus();
    }
  }

  function openEmailAssistant() {
    openDemoModal(emailModal, "email-sample");
  }

  function closeEmailAssistant() {
    closeDemoModal(emailModal);
  }

  function openIntakeQualifier() {
    openDemoModal(intakeModal, "intake-sample");
  }

  function closeIntakeQualifier() {
    closeDemoModal(intakeModal);
  }

  if (emailModal) {
    $("email-assistant-close").addEventListener("click", closeEmailAssistant);
    emailModal.querySelectorAll("[data-email-close]").forEach((el) => {
      el.addEventListener("click", closeEmailAssistant);
    });
  }

  if (intakeModal) {
    $("intake-qualifier-close").addEventListener("click", closeIntakeQualifier);
    intakeModal.querySelectorAll("[data-intake-close]").forEach((el) => {
      el.addEventListener("click", closeIntakeQualifier);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (intakeModal && !intakeModal.hidden) {
      closeIntakeQualifier();
      return;
    }
    if (emailModal && !emailModal.hidden) {
      closeEmailAssistant();
      return;
    }
    if (lightbox && !lightbox.hidden) closeVideoLightbox();
  });

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("'", "&#39;");
  }

  /* Contact */
  const contactForm = $("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = Object.fromEntries(new FormData(form));
      const status = $("form-status");

      if (!data.name || !data.email || !data.message) {
        status.textContent = "Name, email, and a message are required.";
        return;
      }

      const needLabel = {
        design: "Website Design",
        redesign: "Website Redesign",
        automation: "Automation",
        "website-and-automation": "Website and Automation",
      }[data.need] || data.need;

      const subject = `Project inquiry — ${needLabel} — ${data.company || data.name}`;
      const body = [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Company: ${data.company || "—"}`,
        `Need: ${needLabel}`,
        "",
        data.message,
      ].join("\n");

      const href = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
      status.textContent = `Your email client should open a draft to ${SITE.contactEmail}. If it doesn’t, write that address directly.`;
    });
  }

  /* Chatbot */
  const REPLIES = [
    {
      tests: [/redesign|rebuild|refresh|existing site|current site/i],
      text: "Yes — redesign is a core service. We keep the URL, clarify the story, tighten the pages, and usually pair the rebuild with maintenance so it doesn’t drift. If you also need intake or a chatbot on the new site, that’s the same engagement.",
    },
    {
      tests: [/maintain|update|wordpress|cms|care|retainer/i],
      text: "Updates and maintenance cover copy, components, CMS, performance, and the small ongoing work after launch. We can run that on a site we built or on one you already have.",
    },
    {
      tests: [/automat|ops|routing|follow-?up|reporting|busywork/i],
      text: "AI business automation is for the copy-paste layer: intake, routing, follow-up, and reporting. We map the current workflow first, then put a model only where a person was moving information.",
    },
    {
      tests: [/chatbot|assistant|widget|slack/i],
      text: "This panel is a demo of chatbot UX — scripted, on-page, no data leaving the browser. Production work is different: answers from your content, qualification, and a handoff into email, CRM, or Slack.",
    },
    {
      tests: [/workflow|integrat|crm|docs|support/i],
      text: "Workflow integration means the model is a step in the actual sequence of work — CRM, docs, support, ops — not a side demo. Tell us which tools the team already lives in.",
    },
    {
      tests: [/design|new site|website|web|brand/i],
      text: "Website design here means a new site with a point of view: structure, type, and interaction. If you already have a site, look at redesign. If you need the public site plus AI behind it, that’s the usual pairing.",
    },
    {
      tests: [/price|cost|rate|how much|pricing|payment|deposit|invoice/i],
      text: "Scroll to Pricing for starting prices. Projects are 50% deposit before kickoff and 50% before launch. Maintenance is billed monthly in advance. Custom quotes go through Contact.",
    },
    {
      tests: [/start|begin|hire|contact|email|project/i],
      text: "Use Contact in the nav, or Start a project. The form on the Contact page opens an email draft. Say whether you need web, AI, or both.",
    },
    {
      tests: [/who|clearpath|cjcode|cj code|you|studio|agenc/i],
      text: "CJ Code builds websites and AI for agencies and companies: design, redesign, maintenance, automation, chatbots, and workflow integration.",
    },
  ];

  const FALLBACK =
    "I can talk through website design, redesign, maintenance, automation, chatbots, and workflow integration. Ask about one of those, or open Contact if you’re ready to brief us.";

  const GREETING =
    "This is a demo assistant for CJ Code services. Ask about design, redesign, maintenance, automation, chatbots, or putting AI into a workflow.";

  const panel = $("chat-panel");
  const chatToggle = $("chat-toggle");
  const chatLog = $("chat-log");
  const chatInput = $("chat-input");
  let greeted = false;

  function addBubble(text, who) {
    const el = document.createElement("p");
    el.className = `chat-bubble ${who}`;
    el.textContent = text;
    chatLog.appendChild(el);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function replyTo(message) {
    const hit = REPLIES.find((entry) => entry.tests.some((rx) => rx.test(message)));
    return hit ? hit.text : FALLBACK;
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

  $("chat-close").addEventListener("click", closeChat);

  $("chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    addBubble(text, "user");
    chatInput.value = "";
    window.setTimeout(() => addBubble(replyTo(text), "bot"), 280);
  });

  renderWork();
})();
