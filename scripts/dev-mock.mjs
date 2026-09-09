/**
 * Local static + /api/chat stand-in when you are not logged into Wrangler.
 * Uses the same worker handler; replies are keyword-aware mocks, not Workers AI.
 *
 *   node scripts/dev-mock.mjs
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { handleChatRequest, resetRateLimits } from "../src/chat.js";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PORT = Number(process.env.PORT || 8787);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".ico": "image/x-icon",
};

function mockReply(text, turns) {
  const t = String(text).toLowerCase();
  if (/weather|recipe|homework|crypto|joke|capital of/.test(t)) {
    return "I stay on CJ Code work — websites, chatbots, automation, and maintenance. What are you trying to get live or running more smoothly?";
  }
  if (/price|cost|how much|pricing|deposit/.test(t)) {
    return "Starting points, not a final quote: new site $750, redesign $500, one focused automation $300, maintenance $75/month. Scope changes the number. What do you already have live, and is this web, automation, or both?";
  }
  if (/redesign|rebuild|existing site|current site/.test(t)) {
    return "Yes — redesign is a core service. We keep the URL, clarify the story, and tighten pages. Starting at $500 depending on the current site. What’s live today, and what’s the main thing it should do better?";
  }
  if (/chatbot|assistant|widget/.test(t)) {
    return "This panel is the live CJ Code assistant for this site. For a client, we’d ground answers in their content and hand off into email, CRM, or Slack. Are you looking for a bot on your own site, or something behind the scenes?";
  }
  if (/automat|workflow|crm|follow-?up/.test(t)) {
    return "Automation starts at $300 for one focused workflow — intake, routing, follow-up, reporting. More complex chains are a custom quote. Which tools does the team already live in?";
  }
  if (/maintain|update|retainer/.test(t)) {
    return "Maintenance starts at $75/month for minor copy, images, checks, and small fixes. Bigger pages or features are quoted separately. Do you want someone on tap after launch, or is the site already live elsewhere?";
  }
  if (/book|call|quote|hire|schedule/.test(t)) {
    return "Happy to talk. Leave your name and email in this panel, or pick a time on contact.html — that opens an email draft to hello@cjcode.com. What should we cover on the call?";
  }
  if (/design|website|new site/.test(t)) {
    return "New sites start at $750 for up to five core pages, custom design, mobile layout, a contact form, and launch. If you already have a URL, redesign is usually the better fit. Is this a first site or a replacement?";
  }
  if (turns >= 3) {
    return "I have a bit of context. If you want a human follow-up, leave your details here or book on contact.html. Otherwise tell me the next constraint — timeline, current site, or whether this is web, AI, or both.";
  }
  return "I can help with design, redesign, maintenance, automation, and chatbots. What’s in front of you — a site that needs work, or a workflow you want off someone’s plate?";
}

resetRateLimits();

const env = {
  async runModel(messages) {
    const users = messages.filter((entry) => entry.role === "user");
    const last = users.at(-1);
    await new Promise((resolveWait) => setTimeout(resolveWait, 280));
    return { response: mockReply(last.content, users.length) };
  },
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const trimmed = decoded === "/" ? "/index.html" : decoded;
  const abs = normalize(join(ROOT, trimmed));
  const rel = relative(ROOT, abs);
  if (rel.startsWith("..") || rel.startsWith(`src${sep}`) || rel === "src") return null;
  return abs;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);

  if (url.pathname === "/api/chat") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
    const request = new Request(url, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method || "") ? undefined : Buffer.concat(chunks),
    });
    const response = await handleChatRequest(request, env);
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    res.end(Buffer.from(await response.arrayBuffer()));
    return;
  }

  const filePath = safePath(url.pathname);
  if (!filePath) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  try {
    const info = await stat(filePath);
    const finalPath = info.isDirectory() ? join(filePath, "index.html") : filePath;
    const data = await readFile(finalPath);
    res.writeHead(200, { "Content-Type": TYPES[extname(finalPath)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`CJ Code mock chat at http://127.0.0.1:${PORT}`);
});
