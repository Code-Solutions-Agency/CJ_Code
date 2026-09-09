# CJ Code — Websites & AI for businesses

CJ Code portfolio site for agencies and companies: website design, redesign, updates and maintenance, AI automation, chatbots, and workflow integration.

Static HTML/CSS/JS plus a Cloudflare Worker for `/api/chat`. No frontend build step.

## Booklane (booking SaaS)

The embeddable booking product lives in [`booking/`](booking/). It is a Next.js + PostgreSQL multi-tenant app: businesses configure services and hours, paste a snippet, and visitors book on their site.

```bash
cd booking
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

See [`booking/README.md`](booking/README.md) for environment variables, the demo tenant (`demo@booklane.dev` / `DemoPass123!`), and embed instructions. Host it on Render with [`booking/docs/render-deploy.md`](booking/docs/render-deploy.md). To put the widget on a client GitHub Pages site, use [`booking/docs/github-pages-install.md`](booking/docs/github-pages-install.md).

## Open locally

Chat needs the Worker (or the mock stand-in). Opening `index.html` as a file still shows the site; the assistant will fail until `/api/chat` is served.

**With Wrangler (Workers AI, same path as production):**

```bash
npx wrangler login
npx wrangler dev
```

Then open the URL Wrangler prints (usually `http://127.0.0.1:8787`). Local `wrangler dev` still calls your Cloudflare account for Workers AI.

**Without a Cloudflare login (UI only, keyword mock replies):**

```bash
node scripts/dev-mock.mjs
```

Then visit `http://127.0.0.1:8787`.

Static-only preview (no chat API):

```bash
npx --yes serve .
```

## Add a project

Work cards render from `js/projects.js`. Empty slots stay as ghost cards until you fill them (three slots total).

Add objects to `window.PROJECTS`:

```js
window.PROJECTS = [
  {
    title: "Northline agency site rebuild",
    client: "Northline",
    category: "Redesign",
    summary: "Rebuilt the marketing site and wired a qualifier chatbot into intake.",
    tags: ["Redesign", "Chatbot"],
    image: "images/northline.jpg",
    video: "media/demo.mp4",
    href: "https://example.com",
  },
];
```

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Card heading |
| `client` | no | Shown under the title |
| `category` | no | Small label (Design, Redesign, Automation, …) |
| `summary` | no | One or two sentences |
| `tags` | no | Array of short labels |
| `image` | no | Path relative to this folder (put files in `images/`) |
| `video` | no | Path to an mp4 (e.g. `media/demo-assistant.mp4`). Plays muted, looping. Prefer over `image` when both are set |
| `demo` | no | `"email-assistant"` or `"intake-qualifier"` — opens a gated sample walkthrough |
| `href` | no | Makes the card a link. Use `"#"` or omit for an unlinked card |

Refresh the browser after you save. No rebuild.

The included demo video (`media/willow-grove-chatbot-v5.mp4`) shows a chatbot on a fictional client site (Willow & Grove). Regenerate it with:

```bash
python scripts/make_demo_video.py
```

Then copy or rename the output if you want a cache-busting filename.

## Contact / book a call

`contact.html` has a booking calendar that runs **on this static site** (GitHub Pages). Visitors pick a time, choose Web / Automation / Web and Automation, and can add extra information. Confirm opens an email draft to `booking.notifyEmail` — no login, no localhost, no extra server.

Hours, need options, timezone, and the notify address are in `js/config.js` under `booking`.

```js
booking: {
  timezone: "America/New_York",
  notifyEmail: "hello@cjcode.com",
  needs: [ /* Web, Automation, Web and Automation */ ],
  hours: [ /* dayOfWeek 0=Sun … 6=Sat, startMinute, endMinute */ ],
}
```

The Booklane app in [`booking/`](booking/) is a separate multi-tenant product. The portfolio contact page does not load it.

## Chat assistant

The corner widget is a live, multi-turn assistant. Messages POST to `/api/chat` on this Worker, which runs **Cloudflare Workers AI** (`@cf/meta/llama-3.1-8b-instruct-fast` — free-tier friendly; 10,000 neurons/day). No OpenAI key is required.

The model is a small on-brand helper: services, starting prices, process, and next steps. It will decline unrelated topics. It can be wrong on edge cases — treat quotes as starting points and send real scoping to a call.

**Leave your details** (or a prompt after buying intent / a few turns) sends name, email, an optional note, and a short transcript to `hello@cjcode.com` through FormSubmit. Conversation continues afterward. Booking still happens on `contact.html`.

```js
contactEmail: "hello@cjcode.com",
chatEndpoint: "/api/chat",
leadEndpoint: "", // blank = FormSubmit AJAX to contactEmail
```

### Cloudflare dashboard (Workers AI)

The `ai` binding in `wrangler.jsonc` is enough for Git-connected deploys (`npx wrangler deploy`, empty build command). After merge + redeploy:

1. Cloudflare Dashboard → **Workers AI**. If the account asks you to enable the service or accept model terms, do that once.
2. Confirm the `cjcode` Worker (routes may show as `www` / `*.cjcode.workers.dev`) has an **AI** binding named `AI`.
3. Optional check: `GET https://www.cjcode.workers.dev/api/chat` should return JSON `{ "ok": true, "service": "cjcode-chat", ... }`.
4. If inference returns 403, the account may be on Workers Free with a paid-only model — this project uses `llama-3.1-8b-instruct-fast`, which is meant to stay on the free allocation.

Optional OpenAI override (not required): `npx wrangler secret put OPENAI_API_KEY` and optionally `OPENAI_MODEL` (default `gpt-4o-mini`). When the secret is set, `/api/chat` uses OpenAI instead of Workers AI.

### FormSubmit activation (chat leads)

1. Serve the site over http(s) (not `file://`) and submit a test lead from the widget.
2. FormSubmit emails a confirmation link to `hello@cjcode.com`. **Click it once.**
3. After that, chat leads arrive as email. You can later paste FormSubmit’s random-string URL into `leadEndpoint` to hide the address in the POST URL.

FormSubmit will not accept submissions from a double-clicked HTML file. If the browser cannot reach it, the widget offers a `mailto:` draft with the transcript.

## Portfolio demos (Projects 2 and 3)

Click **Try Demo** on a work card. Both tools are walkthroughs, not free products:

- Sample inputs only (no pasting a real customer email or a real project request)
- Two generates per demo, per browser
- Output is marked as a demo sample
- No copy button for a sendable reply or a usable client brief

Change the generate cap in `js/config.js` (`demoMaxUses`). Do not put an API key in the frontend.

## Cloudflare

Git-connected Workers (dashboard Create app): deploy command `npx wrangler deploy`, build command empty.

`wrangler.jsonc` serves the static site and runs the Worker first on `/api/*` so chat does not collide with assets. Worker source lives in `src/` and is not uploaded as a public file.
