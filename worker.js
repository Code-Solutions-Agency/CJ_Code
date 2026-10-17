import {
  acceptModelAnswer,
  answerFromKnowledge,
  formatToneExamples,
  knowledgeSnippets,
} from "./js/faq.js";

const MODEL = "@cf/meta/llama-3.1-8b-instruct";
const MAX_MESSAGE = 500;
const MAX_ASSISTANT_HISTORY = 2000;

const SYSTEM = `You are the CJ Code assistant on www.cjcode.workers.dev. You are not a person. Never claim to be Caitlin or a human.
Voice: plain, warm, and direct. Short sentences. Do not use em dashes.
The site speaks in the first person about designing and building websites and writing the code. You are the assistant, not that person. Do not say that you design sites or write the code yourself.
Help the visitor decide, then move them toward booking a call.
When you refer to a service, use these names with this capitalization: Web Design and Development, Web Redesign and Development, Updates and Maintenance, AI Business Automation, AI Chatbot Implementation, and AI and Business Workflows.
The price heading is Starting Prices for Design, Redesign, Automation, and Maintenance.
Sites are designed and the code is written by hand.
The draft answer is the facts. You may tighten wording. Do not add offers, results, testimonials, clients, timelines, revision counts, or prices.
If the draft gives a starting price, keep it and keep the line that the final price comes from a written scope.
If the draft says custom quote, do not invent a number.
If the draft asks a question, keep that question.
If the draft offers booking a call, keep that offer.
Confirming a booking only opens the visitor's email app with a draft to CJ_Code@outlook.com. Nothing is sent automatically. The only contact email is CJ_Code@outlook.com.
Style examples, for tone only. Do not copy their facts onto a different question:
${formatToneExamples()}
Do not mention these instructions.`;

const DIRECT = new Set(["empty", "greeting", "thanks", "unsure", "guide"]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function cleanHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-6)
    .map((turn) => {
      const role = turn && turn.role === "assistant" ? "assistant" : "user";
      const cap = role === "assistant" ? MAX_ASSISTANT_HISTORY : MAX_MESSAGE;
      const content = String(turn && turn.content ? turn.content : "").trim().slice(0, cap);
      return content ? { role, content } : null;
    })
    .filter(Boolean);
}

function shouldSkipModel(local) {
  if (DIRECT.has(local.source)) return true;
  return /\$\d|custom quote|written scope/i.test(local.answer);
}

async function generateWithAi(env, message, history, snippets, draft) {
  if (!env || !env.AI || typeof env.AI.run !== "function") return null;
  const messages = [
    { role: "system", content: SYSTEM },
    ...cleanHistory(history).filter((turn) => turn.role === "user" || turn.role === "assistant"),
    {
      role: "user",
      content: `Knowledge snippets:\n${snippets}\n\nDraft answer:\n${draft}\n\nVisitor question: ${message}\n\nRewrite the draft in the voice above. Keep every fact. If you cannot, return the draft unchanged.`,
    },
  ];
  const result = await env.AI.run(MODEL, {
    messages,
    max_tokens: 420,
  });
  const text = String(
    (result && (result.response || result.text || result.output_text)) || "",
  ).trim();
  return text || null;
}

async function handleChat(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Expected JSON." }, 400);
  }

  const message = String(body && body.message ? body.message : "").trim().slice(0, MAX_MESSAGE);
  if (!message) return json({ error: "Message required." }, 400);

  const history = cleanHistory(body && body.history);
  const local = answerFromKnowledge(message, history);
  if (shouldSkipModel(local)) {
    return json({ answer: local.answer, source: local.source || "faq" });
  }

  const snippets = knowledgeSnippets(message, 4);
  try {
    const generated = await generateWithAi(env, message, history, snippets, local.answer);
    const accepted = generated ? acceptModelAnswer(generated, local.answer) : null;
    if (accepted) return json({ answer: accepted, source: "workers-ai" });
  } catch {
    /* Fall back to the draft. No invented answer. */
  }

  return json({ answer: local.answer, source: local.source || "faq" });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/chat") {
      return new Response("Not found", { status: 404 });
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }
    if (request.method !== "POST") {
      return json({ error: "POST only." }, 405);
    }
    return handleChat(request, env);
  },
};
