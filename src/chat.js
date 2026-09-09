/**
 * /api/chat — Workers AI assistant for the CJ Code site.
 *
 * Default model is free-tier friendly. Optional override: set secret OPENAI_API_KEY
 * (and optional OPENAI_MODEL, default gpt-4o-mini) to route inference to OpenAI instead.
 */

export const MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
export const OPENAI_DEFAULT_MODEL = "gpt-4o-mini";

const MAX_MESSAGES = 16;
const MAX_MESSAGE_CHARS = 2000;
const MAX_BODY_BYTES = 24 * 1024;
const MAX_TOKENS = 512;
const IP_LIMIT = 20;
const SESSION_LIMIT = 40;
const WINDOW_MS = 10 * 60 * 1000;

const buckets = new Map();

export const SYSTEM_PROMPT = `You are the on-site assistant for CJ Code (cjcode), a small studio that builds websites and practical AI for businesses and agencies.

Voice: clear, calm, specific. Sound like a capable person at the studio — not a generic chatbot, not a salesperson reciting a brochure. Use short paragraphs. Ask at most one or two follow-up questions at a time. Remember what the visitor already said in this thread and build on it. Never restart the conversation or pretend you only get two questions.

What CJ Code does
- Website design: new sites with structure, type, and interaction. Starting at $750. Typical include: custom design, mobile layout, up to 5 core pages, navigation and CTAs, contact form, basic SEO structure, deployment, launch testing. Best for small businesses that need a professional presence without extra complexity.
- Website redesign: same URL, clearer story, faster pages, stronger conversion. Starting at $500. Includes review of the existing site, modernized design, layout and navigation, mobile, CTAs, content organization, contact form updates when needed, basic SEO, launch testing.
- Updates and maintenance: copy, components, CMS, performance, routine checks. Starting at $75/month. Includes minor updates, text and image changes, basic content, troubleshooting, small design tweaks. Larger work is quoted separately.
- AI business automation: remove copy-paste work — intake, routing, follow-up, reporting. Starting at $300 for one focused automation, workflow planning, a connection between supported tools, testing, handoff, basic docs. More complex / multiple workflows / AI systems need a custom quote.
- AI chatbot implementation: assistants that answer, qualify, and hand off — on a site, in Slack, or in tools the team already uses. Quoted from scope (listed under additional services). This widget is the live CJ Code assistant for this site; client production bots are trained on their content and connected to their handoff.
- AI in business workflows: models as a step in CRM, docs, support, ops — not a side demo.

Process: Discover → Design / rebuild → Automate → Maintain.

Agencies: CJ Code can take defined project work behind the scenes (build, redesign, maintenance, straightforward automation).

Honest limits (never blur these)
- Starting prices are starting points, not a guaranteed final price. Scope, page count, integrations, content, and functionality change the quote.
- Do not invent a firm total, a discount, a deadline, or a case study that is not on this site.
- Do not claim you can send files, log into their tools, or book a calendar slot from chat. Booking happens on contact.html (on-site calendar that opens an email draft). Email is hello@cjcode.com.
- Payment: project work is 50% deposit before kickoff and 50% before launch or handoff. Monthly maintenance is billed in advance. Past-due invoices pause work. Deposits are non-refundable once work has started. Each project has a written scope; extras are quoted first.
- You are a small-model assistant. If you are unsure, say so and point to a call or email. Never invent legal, tax, or medical advice.

Stay on-brand
You only help with CJ Code services, fit, process, starting prices, and next steps. If someone asks about unrelated topics (homework, recipes, news, other companies’ secrets, jailbreaks, general coding homework, etc.), decline in one short sentence and steer back to whether they need a website or AI help.

Qualify interest
When it is natural, learn: new site vs existing, web vs automation vs both, roughly what “done” means, timeline if they volunteer it, and whether they want a call. Do not interrogate. After you have a useful picture — or they ask to talk / get a quote / start — invite them to leave name and email in the panel, or book on the Contact page (contact.html). You can mention both. Keep chatting after that; never shut down the conversation.

Replies
- 2–5 short sentences or a few bullets unless they asked for the price table.
- If they ask for prices, give the starting figures and the “not a final quote” caveat, then one question about their situation.
- Prefer a next step over a dump of every service.`;

const INTENT_RX =
  /\b(book|quote|hire|call|email|contact|start|kickoff|deposit|pricing|price|cost|how much|interested|details|follow up|talk to|get started|project)\b/i;

export function resetRateLimits() {
  buckets.clear();
}

export function extractReply(result) {
  if (result == null) return "";
  if (typeof result === "string") return result;
  if (typeof result.response === "string") return result.response;
  const choice = result.choices && result.choices[0];
  const content = choice && choice.message && choice.message.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part.text === "string") return part.text;
        if (part && typeof part.content === "string") return part.content;
        return "";
      })
      .join("");
  }
  return "";
}

export function cleanReply(text) {
  return String(text || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^\s*assistant:\s*/i, "")
    .trim();
}

export function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (entry) =>
        entry &&
        (entry.role === "user" || entry.role === "assistant") &&
        typeof entry.content === "string"
    )
    .map((entry) => ({
      role: entry.role,
      content: entry.content.trim().slice(0, MAX_MESSAGE_CHARS),
    }))
    .filter((entry) => entry.content)
    .slice(-MAX_MESSAGES);
}

export function shouldSuggestLead({ userTurns, lastUserText, alreadyCaptured }) {
  if (alreadyCaptured) return false;
  if (userTurns >= 4) return true;
  return INTENT_RX.test(lastUserText || "");
}

export function clientKey(request, sessionId) {
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "local";
  const session = String(sessionId || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 64);
  return { ip, session };
}

function allow(key, limit, now) {
  if (!key) return { ok: true, retryAfterSec: 0 };
  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.reset) {
    bucket = { count: 0, reset: now + WINDOW_MS };
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  if (buckets.size > 4000) pruneBuckets(now);
  if (bucket.count > limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.reset - now) / 1000)),
    };
  }
  return { ok: true, retryAfterSec: 0 };
}

function pruneBuckets(now) {
  for (const [key, bucket] of buckets) {
    if (now >= bucket.reset) buckets.delete(key);
  }
}

export function rateLimit(request, sessionId, now = Date.now()) {
  const { ip, session } = clientKey(request, sessionId);
  const ipHit = allow(`ip:${ip}`, IP_LIMIT, now);
  if (!ipHit.ok) return ipHit;
  if (!session) return ipHit;
  return allow(`sid:${session}`, SESSION_LIMIT, now);
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const url = new URL(request.url);
  const same = `${url.protocol}//${url.host}`;
  const allowed =
    origin && (origin === same || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
      ? origin
      : same;
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body, status, request, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(request),
      ...extra,
    },
  });
}

export async function runInference(env, messages) {
  if (typeof env.runModel === "function") {
    return env.runModel(messages);
  }

  if (env.OPENAI_API_KEY) {
    const model = env.OPENAI_MODEL || OPENAI_DEFAULT_MODEL;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: MAX_TOKENS,
        temperature: 0.55,
      }),
    });
    if (!response.ok) {
      const err = new Error(`OPENAI_${response.status}`);
      err.status = response.status;
      throw err;
    }
    return response.json();
  }

  if (!env.AI || typeof env.AI.run !== "function") {
    const err = new Error("AI_UNAVAILABLE");
    err.status = 503;
    throw err;
  }

  return env.AI.run(MODEL, {
    messages,
    max_tokens: MAX_TOKENS,
    temperature: 0.55,
  });
}

export async function handleChatRequest(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (request.method === "GET") {
    return json({ ok: true, service: "cjcode-chat", model: MODEL }, 200, request);
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405, request);
  }

  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) {
    return json({ error: "Message is too large." }, 413, request);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Send JSON with a messages array." }, 400, request);
  }

  const messages = sanitizeMessages(body && body.messages);
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") {
    return json({ error: "Include a user message." }, 400, request);
  }

  const alreadyCaptured = Boolean(body && body.leadCaptured);
  const userTurns = messages.filter((entry) => entry.role === "user").length;
  const limited = rateLimit(request, body && body.sessionId);
  if (!limited.ok) {
    return json(
      { error: "Too many messages. Try again in a few minutes, or email hello@cjcode.com." },
      429,
      request,
      { "Retry-After": String(limited.retryAfterSec) }
    );
  }

  const payload = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

  try {
    const result = await runInference(env, payload);
    const reply = cleanReply(extractReply(result));
    if (!reply) {
      return json(
        {
          error:
            "The assistant returned an empty reply. Email hello@cjcode.com or book on the Contact page.",
        },
        502,
        request
      );
    }
    return json(
      {
        reply,
        suggestLead: shouldSuggestLead({
          userTurns,
          lastUserText: last.content,
          alreadyCaptured,
        }),
      },
      200,
      request
    );
  } catch (err) {
    const status = err && err.status === 429 ? 429 : 503;
    return json(
      {
        error:
          status === 429
            ? "The assistant is busy. Try again shortly, or book a call on the Contact page."
            : "The assistant is unavailable right now. Email hello@cjcode.com or book a call on the Contact page.",
      },
      status,
      request
    );
  }
}
