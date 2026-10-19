/**
 * FAQ retrieval and the decision guide for the CJ Code assistant.
 * Facts stay aligned with index.html, contact.html, and js/config.js.
 * Do not invent prices, timelines, clients, or results.
 */

import {
  AI_FIT_A,
  ASK_AUTO,
  ASK_NARROW,
  ASK_NEED,
  ASK_WEB,
  BOOKING_NEXT,
  CLIENT_FAQ,
  EMPTY,
  EXTRAS_A,
  FAQ_NEXT,
  GREETING,
  IDENTITY,
  NO_PROMISE,
  OFFERS,
  STILL_CHOOSING,
  QUESTION_MARKERS,
  SERVICES_BRIEF,
  THANKS,
  TIMELINE_A,
  UNSURE,
  WORK_HONEST,
  autoUnsure,
  noDiscount,
  priceMenu,
  quoteReply,
  webBoth,
} from "./assistant-content.js";

export {
  GREETING,
  TONE_EXAMPLES,
  formatToneExamples,
} from "./assistant-content.js";

export const BOOK_A_CALL = BOOKING_NEXT;

export const FAQ = [
  {
    id: "who",
    tags: ["cj code", "about", "who", "agency", "company", "studio"],
    q: "Who is CJ Code and what do you do?",
    a: "CJ Code designs and builds modern websites, writes the code, keeps them current, and adds practical AI, including chatbots, lead capture, and the automations behind the site. I'm the site assistant, not that person. The work is for businesses. Agencies can hand off a defined website or automation job. " + FAQ_NEXT,
  },
  {
    id: "paths",
    tags: ["services", "offer", "paths", "what you do"],
    q: "What services do you offer?",
    a: `${SERVICES_BRIEF} ${ASK_NEED}`,
  },
  {
    id: "design",
    tags: ["design", "development", "new site", "website", "package"],
    q: "What is Web Design and Development, and what does it cost?",
    a: quoteReply(["design"]),
  },
  {
    id: "redesign",
    tags: ["redesign", "development", "rebuild", "refresh", "existing site", "outdated"],
    q: "What is Web Redesign and Development, and what does it cost?",
    a: quoteReply(["redesign"]),
  },
  {
    id: "automation",
    tags: ["automation", "automate", "workflow", "lead capture", "follow-up"],
    q: "What is AI Business Automation, and what does it cost?",
    a: quoteReply(["automation"]),
  },
  {
    id: "maintenance",
    tags: ["maintenance", "updates", "retainer", "cms", "wordpress"],
    q: "What is Updates and Maintenance, and what does it cost?",
    a: quoteReply(["maintenance"]),
  },
  {
    id: "chatbot-service",
    tags: ["chatbot", "assistant", "widget", "slack", "qualify"],
    q: "Do you build AI chatbots? How much?",
    a: quoteReply(["chatbot"]),
  },
  {
    id: "answer-calls",
    tags: ["have my calls answered", "answer my calls", "answer calls", "phone", "phones", "missed calls"],
    q: "Have my calls answered?",
    a: "Phone answering is not a package on this site. AI Chatbot Implementation can answer, qualify, and hand off inquiries on your site or in the tools you already use, and that work is a custom quote. AI and Business Workflows are custom quotes as well. To talk through what you need, book a call on Contact or email CJ_Code@outlook.com.",
  },
  {
    id: "workflow-ai",
    tags: ["workflow", "integration", "crm", "docs", "ops", "models"],
    q: "What is AI and Business Workflows, and is it priced?",
    a: quoteReply(["workflow"]),
  },
  {
    id: "starting-prices",
    tags: ["price", "pricing", "cost", "rate", "how much", "quote"],
    q: "What are the starting prices?",
    a: `${priceMenu()} ${ASK_NEED}`,
  },
  {
    id: "includes-design",
    tags: ["includes", "included", "design", "development", "pages"],
    q: "What is included in Web Design and Development?",
    a: "The Web Design and Development starting package includes Custom Web Design and Development, a mobile-responsive layout, up to 5 core pages, clear navigation and calls to action, a contact form, basic SEO structure, deployment and setup, and basic launch testing. It starts at $750. That figure is a starting point. The final price comes from a written scope before any work starts. " + FAQ_NEXT,
  },
  {
    id: "not-included",
    tags: ["not included", "extra", "additional", "out of scope", "custom", "landing"],
    q: "What is not in the standard packages?",
    a: "Quoted separately: additional pages, landing pages, advanced forms, AI Chatbot Implementation, advanced automations, third-party integrations, custom functionality, and ongoing technical support. Requests outside the written scope are quoted before that extra work begins. " + FAQ_NEXT,
  },
  {
    id: "payment",
    tags: ["payment", "deposit", "invoice", "kickoff", "terms", "refund"],
    q: "How does payment work?",
    a: "Project work is a 50% deposit before kickoff. The remaining 50% is due before launch or handoff. Final files, admin access, and go-live happen after that balance is paid. Monthly maintenance is billed in advance. Past-due invoices pause active work. Deposits are non-refundable once work has started. " + FAQ_NEXT,
  },
  {
    id: "scope",
    tags: ["scope", "contract", "changes", "extras"],
    q: "How is project scope handled?",
    a: "Each project has a written scope before work starts. Requests outside that scope are quoted separately and billed before the extra work begins. " + FAQ_NEXT,
  },
  {
    id: "process",
    tags: ["process", "discover", "steps", "how you work"],
    q: "What is the process?",
    a: "It's a short path. Discover covers goals, constraints, the current site or workflow, and what done has to mean. Then Web Design and Development or Web Redesign and Development. Then automate: chat, handoffs, and repetitive tasks. Then maintain, so the site and the automations don't stall after launch. " + FAQ_NEXT,
  },
  {
    id: "agency",
    tags: ["agency", "agencies", "overflow", "subcontract", "hands"],
    q: "Do you work with agencies?",
    a: "Yes. Agencies can hand off defined website or automation work: Web Design and Development, Web Redesign and Development, an Updates and Maintenance task, or a straightforward AI Business Automation, behind the scenes. " + FAQ_NEXT,
  },
  {
    id: "booking",
    tags: ["booking", "book", "call", "contact", "calendar", "schedule", "email"],
    q: "How do I book a call or get in touch?",
    a: "Use Book a call on Contact. Pick a time in Central Time, Monday through Thursday, 1:00 to 3:00pm. Friday is closed. Choose Web, Automation, or both, add any extra detail, and confirm. Confirming only opens your email app with a draft to CJ_Code@outlook.com. Nothing is sent until you send that email. You don't need an account. You can also email CJ_Code@outlook.com directly.",
  },
  {
    id: "hours",
    tags: ["hours", "availability", "timezone", "central", "when"],
    q: "When are booking hours?",
    a: "Booking slots are Monday through Thursday, 1:00 to 3:00pm Central Time. Friday is closed. Times on Contact are shown in Central Time. " + FAQ_NEXT,
  },
  {
    id: "work-demos",
    tags: ["work", "demo", "sample", "willow", "harbor", "portfolio", "clients"],
    q: "Are the Work projects real client sites?",
    a: WORK_HONEST,
  },
  {
    id: "this-assistant",
    tags: ["this chat", "this widget", "scripted", "assistant", "person"],
    q: "What is this chat widget?",
    a: IDENTITY,
  },
  ...CLIENT_FAQ,
];

const STOP = new Set([
  "the", "and", "for", "you", "your", "are", "is", "this", "that", "with",
  "what", "how", "can", "do", "does", "a", "an", "to", "of", "in", "on",
  "or", "we", "me", "my", "it", "be", "about", "please", "just",
]);

const ALIASES = {
  cost: "price",
  costs: "price",
  pricing: "price",
  prices: "price",
  rate: "price",
  rates: "price",
  fee: "price",
  fees: "price",
  quote: "price",
  quotes: "price",
  package: "price",
  packages: "price",
  much: "price",
  expensive: "price",
  cheap: "price",
  included: "includes",
  include: "includes",
  including: "includes",
  deposit: "payment",
  invoice: "payment",
  invoices: "payment",
  pay: "payment",
  paid: "payment",
  kickoff: "payment",
  refund: "payment",
  refundable: "payment",
  book: "booking",
  booking: "booking",
  call: "booking",
  phones: "phone",
  answered: "answer",
  schedule: "booking",
  calendar: "booking",
  appointment: "booking",
  contact: "booking",
  email: "booking",
  hello: "booking",
  reach: "booking",
  redesign: "redesign",
  rebuild: "redesign",
  refresh: "redesign",
  outdated: "redesign",
  existing: "redesign",
  design: "design",
  develop: "design",
  development: "design",
  developer: "design",
  website: "design",
  websites: "design",
  site: "design",
  sites: "design",
  maintain: "maintenance",
  maintenance: "maintenance",
  update: "maintenance",
  updates: "maintenance",
  retainer: "maintenance",
  wordpress: "maintenance",
  cms: "maintenance",
  chatbot: "chatbot",
  chatbots: "chatbot",
  bot: "chatbot",
  assistant: "chatbot",
  widget: "chatbot",
  slack: "chatbot",
  automate: "automation",
  automation: "automation",
  automations: "automation",
  workflow: "workflow",
  workflows: "workflow",
  crm: "workflow",
  integration: "workflow",
  integrations: "workflow",
  agency: "agency",
  agencies: "agency",
  overflow: "agency",
  demo: "demo",
  demos: "demo",
  sample: "demo",
  willow: "demo",
  grove: "demo",
  harbor: "demo",
  process: "process",
  discover: "process",
  timeline: "timeline",
  turnaround: "timeline",
  deadline: "timeline",
  weeks: "timeline",
  long: "timeline",
  hours: "hours",
  timezone: "hours",
  central: "hours",
  availability: "hours",
  available: "hours",
  who: "about",
  studio: "about",
  ownership: "ownership",
  owns: "ownership",
  revision: "revisions",
  revisions: "revisions",
  edits: "revisions",
  provide: "provide",
  assets: "provide",
  prepare: "provide",
};

function tokens(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s$]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP.has(word))
    .map((word) => ALIASES[word] || word);
}

function intentBoost(question, entry) {
  const q = norm(question);
  const id = entry.id;
  let extra = 0;
  if (/how long|timeline|turnaround|how soon|how many weeks/.test(q) && id === "timeline") extra += 12;
  if (/who owns|ownership|admin access|final files|source code/.test(q) && id === "ownership") extra += 12;
  if (/revision|how many (edits|changes|rounds)/.test(q) && id === "revisions") extra += 12;
  if (/what do (i|we) need to (provide|send|give)|what should (i|we) (send|prepare|bring)|assets|materials/.test(q) && id === "provide") extra += 12;
  if (/after launch|after (it |we )?(go|goes) live|once it'?s live|post-?launch/.test(q) && id === "after-launch") extra += 12;
  if (/(\bai\b|chatbots?).{0,40}\bfit\b|\bfit\b.{0,40}(\bai\b|chatbots?)|how (do|does) (ai|a chatbot|chatbots?)/.test(q) && id === "how-ai-fits") extra += 12;
  if (/how do (i|we) book|book a call|schedule a call/.test(q) && id === "booking") extra += 8;
  if (/what do you (do|offer)|what services/.test(q) && id === "paths") extra += 8;
  if (/who is cj|what is cj code|about cj/.test(q) && id === "who") extra += 8;
  if (/are you (a )?(person|human|bot)|this (chat|widget)|not a person/.test(q) && id === "this-assistant") extra += 10;
  if (/your clients|testimonials?|case stud|who have you worked|portfolio|sample/.test(q) && id === "work-demos") extra += 12;
  if (/landing page|additional page/.test(q) && id === "not-included") extra += 10;
  return extra;
}

export function retrieve(question, limit = 4) {
  const query = tokens(question);
  if (!query.length) return [];
  const qset = new Set(query);

  const scored = FAQ.map((entry) => {
    const hay = tokens(`${entry.q} ${entry.a} ${(entry.tags || []).join(" ")}`);
    let score = 0;
    for (const token of query) {
      if (hay.includes(token)) score += 1;
      if ((entry.tags || []).some((tag) => tokens(tag).includes(token))) score += 2;
    }

    if (qset.has("redesign") && entry.id === "redesign") score += 6;
    if (qset.has("design") && !qset.has("redesign") && entry.id === "design") score += 6;
    if (qset.has("maintenance") && entry.id === "maintenance") score += 6;
    if (qset.has("automation") && entry.id === "automation") score += 6;
    if (qset.has("chatbot") && entry.id === "chatbot-service") score += 6;
    if (
      entry.id === "answer-calls" &&
      qset.has("answer") &&
      (qset.has("calls") || qset.has("phone") || qset.has("missed"))
    ) {
      score += 8;
    }
    if (qset.has("workflow") && entry.id === "workflow-ai") score += 6;
    if (qset.has("agency") && entry.id === "agency") score += 8;
    if (qset.has("booking") && entry.id === "booking") score += 4;
    if (qset.has("payment") && entry.id === "payment") score += 6;
    if (qset.has("process") && entry.id === "process") score += 6;
    if (qset.has("demo") && entry.id === "work-demos") score += 6;
    if (qset.has("price") && entry.id === "starting-prices") score += 3;
    if (qset.has("includes") && qset.has("maintenance") && entry.id === "maintenance") score += 8;
    if (qset.has("includes") && qset.has("design") && !qset.has("redesign") && !qset.has("maintenance") && entry.id === "includes-design") score += 6;
    if (qset.has("hours") && entry.id === "hours") score += 6;
    if (qset.has("timeline") && entry.id === "timeline") score += 6;
    if (qset.has("ownership") && entry.id === "ownership") score += 6;
    if (qset.has("revisions") && entry.id === "revisions") score += 6;
    if (qset.has("provide") && entry.id === "provide") score += 6;
    score += intentBoost(question, entry);

    return { entry, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

function norm(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[\u2018\u2019`]/g, "'")
    .replace(/[\u2013\u2014]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isGreeting(lower) {
  return /^(hi|hey|hello|yo|good morning|good afternoon|howdy)\b[!.?\s]*$/.test(lower)
    || /^(hi|hey|hello)\b[!.?\s]*(there|again)?[!.?\s]*$/.test(lower);
}

function isThanks(lower) {
  return /^(thanks|thank you|ty|thank you so much)[!.?\s]*$/.test(lower);
}

function isPriceAsk(lower) {
  return /how much|what('s| is| are) (the |your )?(price|prices|cost|rate|rates|fee|fees)|what do you charge|how much do you charge|ballpark|what would (it|this|that) cost/.test(lower)
    || /\b(price|prices|pricing|cost|costs|quote|rates)\b/.test(lower);
}

function isExploring(lower) {
  return /not sure|help me (decide|choose|figure)|where do i start|which (package|service|option)|i need help|looking for help|don'?t know what (i|we) need|can you help me/.test(lower);
}

const FACTUAL_PATTERNS = [
  /how long|timeline|turnaround|how soon|how many weeks/,
  /what do (i|we) need to (provide|send|give|bring)|what should (i|we) (send|prepare|bring|provide)/,
  /who owns|ownership|intellectual property|\bsource code\b|admin access|final files/,
  /\brevisions?\b|how many (rounds|edits|changes)/,
  /after launch|after (it |we )?(go|goes) live|once it'?s live|post-?launch/,
  /how do (i|we) book|how (do|can) (i|we) (schedule|contact|reach|email|write)|book a call|booking hours|what are (your|the) hours|when are you (open|available)|friday is closed|get in touch|contact you|reach you|\b(e-?mail address|your email|email you)\b/,
  /willow|harbor|sample walkthrough|real client|your clients|testimonials?|case stud|who have you worked/,
  /written scope|out of scope|not included|what('s| is) included|what does .+ include/,
  /\bagenc/,
  /what('s| is) (your|the) process|how do you work|walk me through/,
  /what is cj code|who is cj/,
  /(\bai\b|chatbots?).{0,48}\bfit\b|\bfit\b.{0,48}(\bai\b|chatbots?)|how (do|does) (ai|a chatbot|chatbots?)\b/,
];

function isContactAsk(lower) {
  if (/\b(form[- ]to[- ]email|email notification|email follow)\b/.test(lower)) return false;
  if (detectServices(lower).some((kind) => kind !== "web")) return false;
  return /get in touch|contact you|reach you|your email|email you|e-?mail address|how (do|can) (i|we) (book|email|reach|contact|write)|book a call|who (do|can|should) i (email|contact|call)|what('s| is) (your|the) email/.test(lower);
}

function isPureFactual(lower) {
  if (/deposit|invoice|\bpayment\b|non-refundable|\brefund\b/.test(lower)) return true;
  if (isPriceAsk(lower) || isExploring(lower)) return false;
  return FACTUAL_PATTERNS.some((pattern) => pattern.test(lower));
}

function isIdentity(lower) {
  return /who are you|what are you|are you (a )?(real )?(person|human|bot)|what is this (chat|widget|assistant)|are you caitlin|who is caitlin/.test(lower);
}

function isServicesOverview(lower) {
  if (detectServices(lower).some((kind) => kind !== "web")) return false;
  return /what do you (do|offer)|what services|what can you do|what kind of work/.test(lower);
}

function wantsPublishedList(lower) {
  return /starting prices|price list|what are (your|the) (prices|rates|fees)|show me (your )?prices/.test(lower)
    && !detectServices(lower).some((kind) => kind !== "web");
}

export function detectServices(text) {
  const t = norm(text);
  const found = [];
  const namedDesign = /\bweb design and development\b/.test(t);
  const namedRedesign = /\bweb redesign and development\b/.test(t);
  const redesign = namedRedesign
    || /\b(redesign|rebuild|re-design|refresh)\b/.test(t)
    || /\b(outdated|dated)\b/.test(t)
    || /already (have|has) a (web)?site|existing (web)?site|old (web)?site/.test(t)
    || /site is (old|dated|outdated)|looks (old|dated|outdated)/.test(t);
  const design = namedDesign || (!redesign && (
    /\b(new|brand-new|brand new)\b.{0,30}\b(website|site)\b/.test(t)
    || /\b(website|site)\b.{0,30}\bfrom scratch\b/.test(t)
    || /\b(don't|do not) have a (website|site)\b/.test(t)
    || /\bwebsite design\b/.test(t)
    || /\bnew site\b/.test(t)
    || /\bground up\b/.test(t)
    || /\bbuild (me |us )?(a |my )?(new )?(website|site)\b/.test(t)
    || (/\bdesign\b/.test(t) && !/\bdesign adjustments?\b/.test(t))
  ));
  const maintenance = /\bupdates and maintenance\b/.test(t)
    || /\bwebsite maintenance\b/.test(t)
    || /\b(maintenance|retainer|upkeep)\b/.test(t)
    || /keep (the |my |our )?(site|website) updated/.test(t)
    || /\bmonthly (update|updates|maintenance|upkeep)\b/.test(t);
  const chatbot = /\bai chatbot implementation\b/.test(t)
    || /\bchatbot implementation\b/.test(t)
    || /\b(chatbot|chat bot|chatbots)\b/.test(t)
    || /\bai chat\b/.test(t)
    || (/\bslack\b/.test(t) && /\b(bot|assistant|chat)\b/.test(t))
    || (/\bqualif(y|ies|ied)\b/.test(t) && /\b(lead|leads|chat|bot|site)\b/.test(t));
  const workflow = /\bai and business workflows\b/.test(t)
    || /\bworkflow ai\b/.test(t)
    || (/\bworkflows?\b/.test(t) && /\b(ai|model|models|crm|ops)\b/.test(t))
    || (/\b(crm|ops)\b/.test(t) && /\bai\b/.test(t));
  const automation = !chatbot && !workflow && (
    /\bai business automation\b/.test(t)
    || /\bbusiness automation\b/.test(t)
    || /\b(automation|automations|automate)\b/.test(t)
    || /\bfollow[- ]?ups?\b/.test(t)
    || /\bform[- ]to[- ]email\b/.test(t)
  );
  const web = !redesign && !design && !maintenance && /\b(website|websites|web site|site|sites)\b/.test(t);

  if (design) found.push("design");
  if (redesign) found.push("redesign");
  if (web) found.push("web");
  if (automation) found.push("automation");
  if (chatbot) found.push("chatbot");
  if (workflow) found.push("workflow");
  if (maintenance) found.push("maintenance");
  return found;
}

function isVagueAi(lower) {
  const kinds = detectServices(lower);
  if (kinds.some((kind) => kind === "chatbot" || kind === "workflow" || kind === "automation")) return false;
  return /\bai\b|artificial intelligence|custom ai/.test(lower);
}

function lastAssistantContent(history) {
  if (!Array.isArray(history)) return "";
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const turn = history[i];
    if (turn && turn.role === "assistant" && turn.content) return String(turn.content);
  }
  return "";
}

function pendingQuestion(history) {
  const text = lastAssistantContent(history);
  for (const [id, phrase] of QUESTION_MARKERS) {
    if (text.includes(phrase)) return id;
  }
  return null;
}

function questionsAsked(history) {
  if (!Array.isArray(history)) return 0;
  return history.filter((turn) => {
    if (!turn || turn.role !== "assistant") return false;
    const text = String(turn.content || "");
    return QUESTION_MARKERS.some(([, phrase]) => text.includes(phrase));
  }).length;
}

function historyKinds(history) {
  const text = (Array.isArray(history) ? history : [])
    .filter((turn) => turn && turn.role === "user" && turn.content)
    .map((turn) => turn.content)
    .join(" ");
  return detectServices(text);
}

function interpretChoice(lower) {
  const stripped = lower.replace(/[.!?]/g, "").trim();
  const detected = detectServices(stripped);
  if (detected.length) return detected;
  if (/^(a )?(brand )?new( one| site| website)?$/.test(stripped) || /^(i |we )?(don't|do not) have (one|a site|a website|any)$/.test(stripped)) {
    return ["design"];
  }
  if (/^(re-?design|rebuild|old|existing|already live|the old one|current one)$/.test(stripped)) return ["redesign"];
  if (/^(upkeep|maintenance|monthly|monthly upkeep)$/.test(stripped)) return ["maintenance"];
  if (/^(a )?(web)?site$|^website$|^a website$|^web$|^the website$/.test(stripped)) return ["web"];
  if (/^(ai|some ai|artificial intelligence|custom ai)$/.test(stripped)) return ["ai-vague"];
  if (/^(an? )?automation$/.test(stripped)) return ["automation"];
  if (/^(a )?(chatbot|bot)$/.test(stripped)) return ["chatbot"];
  if (/^workflow$|^workflow ai$/.test(stripped)) return ["workflow"];
  return null;
}

function interpretWeb(lower) {
  const stripped = lower.replace(/[.!?]/g, "").trim();
  const redesign = /\b(redesign|rebuild|outdated|dated|refresh|existing|old)\b/.test(lower)
    || /\balready (live|have|has)\b/.test(lower)
    || /\bcurrent (site|one|website)\b/.test(lower)
    || /^(old|existing|current|live|already live)$/.test(stripped);
  const design = /\b(don't|do not) have\b/.test(lower)
    || /\b(brand new|from scratch)\b/.test(lower)
    || /\bnew\b/.test(lower)
    || /^(none|no|nope)$/.test(stripped);
  if (design && !redesign) return "design";
  if (redesign && !design) return "redesign";
  if (design && redesign) return /\b(don't|do not) have\b/.test(lower) ? "design" : "redesign";
  if (/\b(both|either|not sure|unsure|whatever)\b/.test(lower)) return "both-web";
  return null;
}

function interpretAuto(lower) {
  if (/\b(chatbot|chat bot|bot|qualify|slack)\b/.test(lower)) return "chatbot";
  if (/\b(workflow|crm|ops|docs|support)\b/.test(lower)) return "workflow";
  if (/\b(form|email|follow|routing|simple|notification|zapier|automation|one)\b/.test(lower)) return "automation";
  if (/\b(both|not sure|unsure|either)\b/.test(lower)) return "both-auto";
  return null;
}

function routeKinds(kinds, asked) {
  if (kinds.length === 1 && kinds[0] === "ai-vague") {
    return { answer: asked >= 2 ? autoUnsure() : ASK_AUTO, source: "guide" };
  }
  const priced = kinds.filter((kind) => kind !== "web" && kind !== "ai-vague");
  const hasWeb = kinds.includes("web");
  if (hasWeb && !priced.length) {
    return { answer: asked >= 2 ? webBoth() : ASK_WEB, source: "guide" };
  }
  if (hasWeb && priced.length) {
    if (asked >= 2) return { answer: quoteReply([...priced, "design", "redesign"]), source: "guide" };
    const leads = priced.map((kind) => OFFERS[kind].lead).join(" ");
    return { answer: `${leads} ${ASK_WEB}`, source: "guide" };
  }
  return { answer: quoteReply(priced), source: "guide" };
}

function extrasFromHistory(history, drop) {
  return historyKinds(history).filter((kind) => !drop.includes(kind));
}

function answerWeb(lower, history) {
  const choice = interpretWeb(lower);
  const extras = extrasFromHistory(history, ["web", "design", "redesign"]);
  if (choice === "design" || choice === "redesign") {
    return { answer: quoteReply([choice, ...extras]), source: "guide" };
  }
  const kinds = ["design", "redesign", ...extras];
  return {
    answer: quoteReply(kinds, {
      preface: "It depends on whether the site is new or already live.",
    }),
    source: "guide",
  };
}

function answerAuto(lower, history) {
  const choice = interpretAuto(lower);
  const extras = extrasFromHistory(history, ["chatbot", "workflow", "automation"]);
  if (choice === "chatbot" || choice === "workflow" || choice === "automation") {
    return { answer: quoteReply([choice, ...extras]), source: "guide" };
  }
  return {
    answer: quoteReply(["automation", "chatbot", "workflow", ...extras], {
      preface: "It depends on which kind of AI work you mean.",
    }),
    source: "guide",
  };
}

function answerNeed(lower, asked) {
  const choice = interpretChoice(lower);
  if (choice) return routeKinds(choice, asked);
  if (asked >= 2) return { answer: priceMenu(), source: "guide" };
  return { answer: ASK_NARROW, source: "guide" };
}

function answerFresh(lower, asked) {
  if (/\blanding pages?\b|\badditional pages?\b/.test(lower)) {
    return { answer: EXTRAS_A, source: "guide" };
  }
  const kinds = detectServices(lower);
  if (kinds.length) return routeKinds(kinds, asked);
  if (isVagueAi(lower)) {
    return { answer: asked >= 2 ? autoUnsure() : ASK_AUTO, source: "guide" };
  }
  if (wantsPublishedList(lower)) {
    return { answer: `${priceMenu()} ${ASK_NEED}`, source: "guide" };
  }
  if (isPriceAsk(lower) || isExploring(lower) || /^(i|we) (need|want|am looking|are looking|'m looking)\b/.test(lower)) {
    return { answer: asked >= 2 ? priceMenu() : ASK_NEED, source: "guide" };
  }
  return null;
}

function isCallsRequest(lower) {
  return /have my calls answered|answer my calls|answer calls|missed calls/.test(lower)
    || (/\b(answer|answered|answering)\b/.test(lower) && /\b(calls|phones?)\b/.test(lower));
}

export function guideReply(message, history = []) {
  const lower = norm(message);
  if (!lower || isGreeting(lower) || isThanks(lower)) return null;
  if (isCallsRequest(lower)) return null;
  if (/^(hmm+|no idea|idk|i don't know|not sure|whatever|you (pick|choose|tell me))[!.?\s]*$/.test(lower)) {
    const pending = pendingQuestion(history);
    const asked = questionsAsked(history);
    if (pending === "web") return answerWeb(lower, history);
    if (pending === "auto") return answerAuto(lower, history);
    if ((pending === "need" || pending === "narrow") && asked < 2) {
      return { answer: ASK_NARROW, source: "guide" };
    }
    if (asked >= 2 || pending === "need" || pending === "narrow") {
      return { answer: STILL_CHOOSING, source: "guide" };
    }
    return { answer: ASK_NEED, source: "guide" };
  }
  if (/\b(guarantee|guaranteed|promise)\b/.test(lower) || /first page|page one|double (my|our) (sales|revenue|leads)/.test(lower)) {
    return { answer: NO_PROMISE, source: "guide" };
  }
  if (/\b(discount|coupon|cheaper|lowest price|best price)\b/.test(lower)) {
    return { answer: noDiscount(), source: "guide" };
  }
  if (isIdentity(lower)) return { answer: IDENTITY, source: "guide" };
  if (isServicesOverview(lower)) return { answer: `${SERVICES_BRIEF} ${ASK_NEED}`, source: "guide" };
  if (isPureFactual(lower)) {
    const priced = detectServices(lower).filter((kind) => kind !== "web");
    if (priced.length && /book|schedule/.test(lower) && !/how long|timeline|revision|owns|ownership/.test(lower)) {
      return { answer: quoteReply(priced), source: "guide" };
    }
    return null;
  }

  const pending = pendingQuestion(history);
  const asked = questionsAsked(history);
  if (pending === "web") return answerWeb(lower, history);
  if (pending === "auto") return answerAuto(lower, history);
  if (pending === "need" || pending === "narrow") return answerNeed(lower, asked);
  return answerFresh(lower, asked);
}

export function answerFromKnowledge(question, history = []) {
  const q = String(question || "").trim();
  if (!q) return { answer: EMPTY, source: "empty" };

  const lower = norm(q);
  if (isGreeting(lower)) return { answer: GREETING, source: "greeting" };
  if (isThanks(lower)) return { answer: THANKS, source: "thanks" };

  const guided = guideReply(q, history);
  if (guided) return guided;

  const hits = retrieve(q, 3);
  if (!hits.length || hits[0].score < 3) {
    if (isContactAsk(lower)) {
      const booking = FAQ.find((entry) => entry.id === "booking");
      return { answer: booking.a, source: "faq", ids: ["booking"] };
    }
    return { answer: UNSURE, source: "unsure" };
  }

  return { answer: hits[0].entry.a, source: "faq", ids: hits.map((hit) => hit.entry.id) };
}

export function knowledgeSnippets(question, limit = 4) {
  const hits = retrieve(question, limit);
  if (!hits.length) {
    return FAQ.map((entry) => `Q: ${entry.q}\nA: ${entry.a}`).slice(0, 6).join("\n\n");
  }
  return hits.map((hit) => `Q: ${hit.entry.q}\nA: ${hit.entry.a}`).join("\n\n");
}

const ALLOWED_DOLLARS = new Set(["$750", "$500", "$300", "$75"]);

function dollarAmounts(text) {
  return (String(text || "").match(/\$\s?\d[\d,]*/g) || []).map((raw) => raw.replace(/\s/g, ""));
}

export function acceptModelAnswer(generated, draft) {
  let out = String(generated || "").trim();
  if (!out) return null;
  out = out.replace(/^(assistant|answer)\s*:\s*/i, "");
  out = out.replace(/^["“]+|["”]+$/g, "");
  out = out.replace(/\s*\u2014\s*/g, ". ");
  out = out.replace(/\s+--\s+/g, ". ");
  out = out.replace(/\.\s*\./g, ".");
  out = out.replace(/\s{2,}/g, " ").trim();
  if (!out || /\u2014/.test(out)) return null;
  if (/\bi(?:'| a)?m caitlin\b|\bi am a (real )?person\b|\bi'm a (real )?person\b|\bas an ai language model\b/i.test(out)) {
    return null;
  }
  if (/\b(testimonial|our clients|case study|guaranteed|we guarantee)\b/i.test(out)
    && !/\b(testimonial|our clients|case study|guaranteed|we guarantee)\b/i.test(draft)) {
    return null;
  }
  const draftDollars = dollarAmounts(draft);
  const outDollars = dollarAmounts(out);
  for (const amount of outDollars) {
    if (!ALLOWED_DOLLARS.has(amount) || !draftDollars.includes(amount)) return null;
  }
  for (const amount of draftDollars) {
    if (!outDollars.includes(amount)) return null;
  }
  if (/book a call/i.test(draft) && !/book a call/i.test(out)) return null;
  if (/custom quote/i.test(draft) && !/custom quote/i.test(out)) return null;
  if (/written scope/i.test(draft) && !/written scope/i.test(out)) return null;
  if (/\$\d/.test(draft) && /starting (point|at|package)/i.test(draft) && !/starting (point|at|package)/i.test(out)) {
    return null;
  }
  const loose = (value) => (String(value).match(/\b(\d+|one|two|three|four|five|six|eight|ten)\s+(weeks?|days?|months?)\b/gi) || [])
    .map((item) => item.toLowerCase());
  const draftTime = loose(draft);
  if (loose(out).some((item) => !draftTime.includes(item))) return null;
  if (/\b(\d+|one|two|three|four)\s+(rounds?|revisions?)\b/i.test(out)
    && !/\b(\d+|one|two|three|four)\s+(rounds?|revisions?)\b/i.test(draft)) {
    return null;
  }
  return out;
}

export function assistantCopyHasEmDash() {
  const pieces = [
    ...FAQ.map((entry) => `${entry.q}\n${entry.a}`),
    GREETING,
    THANKS,
    UNSURE,
    EMPTY,
    TIMELINE_A,
    AI_FIT_A,
  ];
  return pieces.some((piece) => /\u2014/.test(piece));
}
