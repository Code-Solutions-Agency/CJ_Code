/**
 * Selected work.
 *
 * Add objects to this array. The Work section on the page renders from here.
 * Leave empty slots unfilled — the page keeps ghost cards until you add more
 * (up to four visible slots).
 *
 * Fields: title, client, category, summary, tags, image, video, demo, preview, href
 * demo: "email-assistant" | "intake-qualifier" — gated sample walkthroughs, not free tools
 * preview: "pratt-works" — CSS shop preview; pair with href to a standalone demo page
 *
 * Example:
 *
 * {
 *   title: "Northline agency site rebuild",
 *   client: "Northline",
 *   category: "Redesign",
 *   summary: "Rebuilt the marketing site and wired a qualifier chatbot into intake.",
 *   tags: ["Redesign", "Chatbot"],
 *   image: "images/northline.jpg",
 *   video: "media/demo.mp4",
 *   href: "https://example.com",
 * }
 */
window.PROJECTS = [
  {
    title: "Garden chat for Willow & Grove",
    client: "Willow & Grove",
    category: "Chatbot",
    summary:
      "A visitor opens Chat with us on a nursery site, asks about raised-bed delivery, follows up on a Thursday drop-off, and gets clear next steps from the garden assistant.",
    tags: ["Chatbot", "Client demo"],
    video: "media/willow-grove-chatbot-v5.mp4",
    href: "#",
  },
  {
    title: "AI Business Email Assistant",
    client: "Harbor & Line",
    category: "Automation",
    summary:
      "Staff pick a sample customer thread, choose type and tone, and see a draft reply. Walkthrough only — not a free inbox tool.",
    tags: ["Automation", "Try Demo"],
    demo: "email-assistant",
    href: "#",
  },
  {
    title: "Project intake for Harbor & Line",
    client: "Harbor & Line",
    category: "Intake",
    summary:
      "A messy inbound request becomes a structured project brief — pages, fit, out of scope, next step. Sample walkthrough, not a free briefing tool.",
    tags: ["Intake", "Try Demo"],
    demo: "intake-qualifier",
    href: "#",
  },
  {
    title: "Shop assistant for Pratt Works",
    client: "Pratt Works",
    category: "Chatbot",
    summary:
      "A maker-shop preview: buyers ask about full-wrap tumblers, custom listings, sample stock, and one demo order. Capped walkthrough — not a free chatbot.",
    tags: ["Chatbot", "Try Demo"],
    preview: "pratt-works",
    href: "demos/pratt-works.html",
  },
];
