/**
 * Voice, FAQ, and pricing copy for the CJ Code assistant.
 * Facts match the public site only. Starting prices are not final quotes.
 * Bot copy uses no em dashes.
 */

export const BOOKING_NEXT =
  "Book a call on Contact. Pick a time in Central Time, Monday through Thursday, 1:00 to 3:00pm, and confirm. Confirming only opens your email app with a draft to CJ_Code@outlook.com. Nothing is sent until you send that email. You can also email CJ_Code@outlook.com directly.";

export const FAQ_NEXT =
  "Book a call on Contact if you want this talked through for your project.";

export const ASK_NEED_Q =
  "What are you hoping to get done? Web Design and Development, Web Redesign and Development, AI Business Automation, Updates and Maintenance, AI Chatbot Implementation, or AI and Business Workflows?";

export const ASK_NEED = `${ASK_NEED_Q} You can also book a call on Contact and sort it out there.`;

export const ASK_WEB_Q =
  "Is this Web Design and Development for a new site, or Web Redesign and Development for a site that's already live?";

export const ASK_WEB = `${ASK_WEB_Q} Book a call on Contact if you'd rather talk it through.`;

export const ASK_AUTO_Q =
  "Is this one focused AI Business Automation, like a form, follow-up, or routing between tools you already use, or is it AI Chatbot Implementation or AI and Business Workflows?";

export const ASK_AUTO = `${ASK_AUTO_Q} Book a call on Contact if you'd rather talk it through.`;

export const ASK_NARROW_Q =
  "If you pick one, is it Web Design and Development or Web Redesign and Development, AI Business Automation or AI Chatbot Implementation, or Updates and Maintenance?";

export const ASK_NARROW = `${ASK_NARROW_Q} Book a call on Contact if you'd rather talk it through.`;

export const QUESTION_MARKERS = [
  ["need", ASK_NEED_Q],
  ["web", ASK_WEB_Q],
  ["auto", ASK_AUTO_Q],
  ["narrow", ASK_NARROW_Q],
];

export const GREETING = `I'm the CJ Code assistant, not a person. ${ASK_NEED}`;

export const IDENTITY =
  "I'm the CJ Code assistant, not a person. The site speaks in the first person because the websites are designed and built by hand and the code is written directly. I can help you sort Web Design and Development, Web Redesign and Development, AI Business Automation, Updates and Maintenance, AI Chatbot Implementation, and AI and Business Workflows, then point you to a starting price and a call. I don't write the final quote. That comes from a written scope. Book a call on Contact when you're ready.";

export const SERVICES_BRIEF =
  "Starting Prices for Design, Redesign, Automation, and Maintenance. Web Design and Development starts at $750. Web Redesign and Development starts at $500. AI Business Automation is the Business Automation package and starts at $300. Updates and Maintenance is the Website Maintenance package and starts at $75/month. AI Chatbot Implementation and AI and Business Workflows are custom quotes. Those are starting points. The final price comes from a written scope before any work starts.";

export const WORK_HONEST =
  "Willow & Grove and Harbor & Line are sample walkthroughs. They show the kind of AI Chatbot Implementation and AI Business Automation described on this site. They are not live client sites. If you want that kind of work scoped for your business, book a call on Contact.";

export const NO_PROMISE =
  "I can't promise a ranking, a revenue number, or any other result. The work covers Web Design and Development, Web Redesign and Development, Updates and Maintenance, AI Business Automation, AI Chatbot Implementation, and AI and Business Workflows. Sites are designed and the code is written by hand. The written scope says what the work includes. Book a call on Contact if you want to talk about your project.";

export const EXTRAS_A =
  "Landing pages and extra pages are not in the starting packages. They're quoted from the scope, along with advanced forms, third-party integrations, and custom functionality. Web Design and Development starts at $750 if what you need is a new site. That figure is a starting point. The final price comes from a written scope before any work starts, not from this chat. Project work is a 50% deposit before kickoff, and the rest is due before launch or handoff. " +
  BOOKING_NEXT;

export const THANKS =
  "Glad to help. When you want to talk through a project, book a call on Contact.";

export const UNSURE =
  "I'm not sure from what this site publishes. Book a call on Contact, or email CJ_Code@outlook.com.";

export const EMPTY =
  "Tell me what you need: Web Design and Development, Web Redesign and Development, AI Business Automation, Updates and Maintenance, AI Chatbot Implementation, or AI and Business Workflows. I can point you to a starting price and how to book a call.";

export const OFFERS = {
  design: {
    lead: "Web Design and Development starts at $750.",
    detail:
      "The starting package is a new site designed and developed from the ground up. It covers Custom Web Design and Development, a mobile-responsive layout, up to 5 core pages, navigation and calls to action, a contact form, basic SEO structure, deployment, and launch testing.",
  },
  redesign: {
    lead: "Web Redesign and Development starts at $500.",
    detail:
      "The starting package covers a review of the live site, a more modern layout and navigation, mobile responsiveness, stronger calls to action, content organization, contact form updates when needed, basic SEO structure, and launch testing. The URL stays the same.",
  },
  automation: {
    lead: "AI Business Automation, the Business Automation package, starts at $300.",
    detail:
      "The starting package is one focused automation: planning, a connection between tools already in use, basic testing, setup, and a short handoff note. Lead capture, form-to-email, follow-ups, and routing fit here. More complex work and multiple workflows are quoted separately. AI Chatbot Implementation and AI and Business Workflows are custom quotes, not this package.",
  },
  maintenance: {
    lead: "Updates and Maintenance, the Website Maintenance package, starts at $75/month.",
    detail:
      "The starting package covers minor updates, text and image changes, basic content updates, routine checks, basic troubleshooting, and small design adjustments. It is billed in advance. Larger updates, new pages, or Web Redesign and Development are quoted separately.",
  },
  chatbot: {
    lead: "AI Chatbot Implementation is a custom quote, not a starting package.",
    detail:
      "That work is assistants that answer, qualify, and hand off, on the site, in Slack, or in tools the team already uses. The assistant on this site is not a production chatbot.",
  },
  workflow: {
    lead: "AI and Business Workflows is a custom quote, not a starting package.",
    detail:
      "That is a model as a step in work already underway, such as CRM, docs, support, or ops.",
  },
};

const ORDER = ["design", "redesign", "automation", "maintenance", "chatbot", "workflow"];

function projectWork(set) {
  return ["design", "redesign", "automation", "chatbot", "workflow"].some((kind) => set.has(kind));
}

export function frame(kinds) {
  const set = new Set(kinds);
  const starters = ["design", "redesign", "automation", "maintenance"].filter((kind) => set.has(kind));
  const custom = ["chatbot", "workflow"].filter((kind) => set.has(kind));
  const lines = [];
  if (starters.length && custom.length) {
    lines.push(
      "Where there is a starting price, that number is only a start. A custom quote does not have a package price. The final price comes from a written scope before any work starts, not from this chat.",
    );
  } else if (starters.length > 1) {
    lines.push(
      "Those are starting points. The final price comes from a written scope before any work starts, not from this chat.",
    );
  } else if (starters.length === 1) {
    lines.push(
      "That figure is a starting point. The final price comes from a written scope before any work starts, not from this chat.",
    );
  } else if (custom.length) {
    lines.push("The final price comes from a written scope before any work starts, not from this chat.");
  }
  if (projectWork(set)) {
    lines.push("Project work is a 50% deposit before kickoff, and the rest is due before launch or handoff.");
  }
  lines.push(BOOKING_NEXT);
  return lines.join(" ");
}

export function quoteReply(kinds, options = {}) {
  const preface = options.preface ? `${options.preface} ` : "";
  const unique = ORDER.filter((kind) => kinds.includes(kind));
  if (!unique.length) return priceMenu();
  const body = unique.map((kind) => `${OFFERS[kind].lead} ${OFFERS[kind].detail}`).join(" ");
  return `${preface}${body} ${frame(unique)}`.replace(/\s+/g, " ").trim();
}

export function priceMenu() {
  return [
    "Starting Prices for Design, Redesign, Automation, and Maintenance.",
    OFFERS.design.lead,
    OFFERS.redesign.lead,
    OFFERS.automation.lead,
    OFFERS.maintenance.lead,
    "AI Chatbot Implementation and AI and Business Workflows are custom quotes.",
    frame(["design", "redesign", "automation", "maintenance", "chatbot"]),
  ].join(" ");
}

export function webBoth() {
  return quoteReply(["design", "redesign"], {
    preface: "It depends on whether the site is new or already live.",
  });
}

export function autoUnsure() {
  return quoteReply(["automation", "chatbot", "workflow"], {
    preface: "It depends on which kind of AI work you mean.",
  });
}

export const STILL_CHOOSING =
  "No problem. Web Design and Development starts at $750. Web Redesign and Development starts at $500. Business Automation starts at $300. Website Maintenance is $75/month. AI Chatbot Implementation and AI and Business Workflows are custom quotes. Those are starting points. The final price comes from a written scope before any work starts, not from this chat. " +
  BOOKING_NEXT;

export function noDiscount() {
  return `There isn't a published discount. ${OFFERS.design.lead} ${OFFERS.redesign.lead} ${OFFERS.automation.lead} ${OFFERS.maintenance.lead} AI Chatbot Implementation and AI and Business Workflows are custom quotes. ${frame(["design", "redesign", "automation", "maintenance", "chatbot"])}`;
}

export const TIMELINE_A =
  "There isn't a fixed timeline on the site. It depends on the scope, and that scope is written down before any work starts. The path is discover, then Web Design and Development or Web Redesign and Development, automate if you need it, and maintain after launch. " +
  FAQ_NEXT;

export const PROVIDE_A =
  "You don't need a finished brief. Discovery covers goals, constraints, the current site or workflow, and what done has to mean. On the booking form, choose Web, Automation, or both, and add any extra detail you already have. If something is missing, it gets named in the written scope before work starts. " +
  FAQ_NEXT;

export const OWNERSHIP_A =
  "The site doesn't publish a separate ownership policy. The remaining 50% is due before launch or handoff, and final files, admin access, and go-live happen after that balance is paid. Anything more specific belongs in the written scope. " +
  FAQ_NEXT;

export const REVISIONS_A =
  "There isn't a published revision count. The written scope says what the work includes before it starts. Requests outside that scope are quoted before the extra work begins. " +
  FAQ_NEXT;

export const AFTER_LAUNCH_A =
  "After launch, Updates and Maintenance is how the site stays current. Website Maintenance starts at $75/month for minor updates, text and image changes, basic content updates, routine checks, basic troubleshooting, and small design adjustments. That is a starting point. The final price comes from a written scope, and the month is billed in advance. Larger updates, new pages, or Web Redesign and Development are quoted on their own. " +
  FAQ_NEXT;

export const AI_FIT_A =
  "AI Chatbot Implementation and AI and Business Workflows sit with AI Business Automation, alongside the site, not instead of it. AI Chatbot Implementation answers, qualifies, and hands off, on the site, in Slack, or in tools already in use. AI and Business Workflows is a model inside the job itself, such as CRM, docs, support, or ops. Both are custom quotes. One focused Business Automation, like a form notice or a follow-up, starts at $300. The final price comes from a written scope before work starts. " +
  FAQ_NEXT;

export const CLIENT_FAQ = [
  {
    id: "timeline",
    tags: ["timeline", "how long", "turnaround", "deadline", "weeks", "schedule"],
    q: "How long does a project take?",
    a: TIMELINE_A,
  },
  {
    id: "provide",
    tags: ["provide", "send", "prepare", "assets", "brief", "materials", "what do I need"],
    q: "What do I need to provide to get started?",
    a: PROVIDE_A,
  },
  {
    id: "ownership",
    tags: ["ownership", "owns", "files", "admin access", "handoff", "source"],
    q: "Who owns the site and the files?",
    a: OWNERSHIP_A,
  },
  {
    id: "revisions",
    tags: ["revision", "revisions", "edits", "rounds", "feedback", "changes"],
    q: "How many revisions are included?",
    a: REVISIONS_A,
  },
  {
    id: "after-launch",
    tags: ["after launch", "go live", "once it's live", "ongoing", "post launch"],
    q: "What happens after launch?",
    a: AFTER_LAUNCH_A,
  },
  {
    id: "how-ai-fits",
    tags: ["how ai fits", "chatbot fit", "alongside", "where does ai", "together"],
    q: "How do AI and chatbots fit with the rest of the work?",
    a: AI_FIT_A,
  },
];

export const TONE_EXAMPLES = [
  {
    situation: "The visitor asks about price and has not said what the work is.",
    visitor: "How much do you charge?",
    assistant: ASK_NEED,
  },
  {
    situation: "The visitor already said the site is new, so name the starting price and the next step.",
    visitor: "It's a new website.",
    assistant: quoteReply(["design"]),
  },
  {
    situation: "The visitor wants an existing site rebuilt.",
    visitor: "My site looks dated and I want it rebuilt.",
    assistant: quoteReply(["redesign"]),
  },
  {
    situation: "The visitor wants a chatbot. There is no package price.",
    visitor: "Can you add a chatbot that qualifies leads?",
    assistant: quoteReply(["chatbot"]),
  },
  {
    situation: "The visitor wants monthly upkeep. That is billed in advance, not as a project deposit.",
    visitor: "Can you keep my site updated every month?",
    assistant: quoteReply(["maintenance"]),
  },
  {
    situation: "The visitor asks for a timeline. Do not invent weeks or days.",
    visitor: "How long does a website take?",
    assistant: TIMELINE_A,
  },
];

export function formatToneExamples() {
  return TONE_EXAMPLES.map(
    (example) =>
      `Situation: ${example.situation}\nVisitor: ${example.visitor}\nAssistant: ${example.assistant}`,
  ).join("\n\n");
}

export function allContentStrings() {
  const strings = [];
  const walk = (value) => {
    if (typeof value === "string") strings.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk({
    GREETING,
    IDENTITY,
    SERVICES_BRIEF,
    WORK_HONEST,
    NO_PROMISE,
    EXTRAS_A,
    STILL_CHOOSING,
    THANKS,
    UNSURE,
    EMPTY,
    BOOKING_NEXT,
    FAQ_NEXT,
    ASK_NEED,
    ASK_WEB,
    ASK_AUTO,
    ASK_NARROW,
    OFFERS,
    CLIENT_FAQ,
    TONE_EXAMPLES,
    samples: [
      quoteReply(["design"]),
      quoteReply(["redesign"]),
      quoteReply(["automation"]),
      quoteReply(["maintenance"]),
      quoteReply(["chatbot"]),
      quoteReply(["workflow"]),
      quoteReply(["redesign", "chatbot"]),
      webBoth(),
      autoUnsure(),
      priceMenu(),
      noDiscount(),
    ],
  });
  return strings;
}
