# Web and AI Services Portfolio

CJ Code portfolio site for agencies and companies: website design, redesign, updates and maintenance, AI automation, chatbots, and workflow integration.

Static HTML/CSS/JS. No build step.

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

1. Open `index.html` in a browser (double-click, or drag it into Chrome/Edge).
2. Optional, from this folder:

```bash
npx --yes serve .
```

Then visit the URL it prints (usually `http://localhost:3000`).

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

`contact.html` has a booking calendar that runs **on this static site**. The live host is Cloudflare Workers (`www.cjcode.workers.dev`). Visitors pick a time, choose Web / Automation / Web and Automation, and can add extra information. Confirm opens an email draft to `booking.notifyEmail` — no login, no localhost, no extra server.

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

## Chat demo

The corner widget is a scripted assistant about these services. Nothing is sent to a server. Swap the replies in `js/app.js` when you wire a real model later.

## Portfolio demos (Projects 2 and 3)

Click **Try Demo** on a work card. Both tools are walkthroughs, not free products:

- Sample inputs only (no pasting a real customer email or a real project request)
- Two generates per demo, per browser
- Output is marked as a demo sample
- No copy button for a sendable reply or a usable client brief

Change the generate cap in `js/config.js` (`demoMaxUses`). Do not put an API key in the frontend.

## Cloudflare

The live site is [https://www.cjcode.workers.dev](https://www.cjcode.workers.dev) (Git-connected Worker `cjcode`). Pushes to `master` deploy it. Dashboard Create app: deploy command `npx wrangler deploy`, build command empty.

Book a call: [https://www.cjcode.workers.dev/contact.html](https://www.cjcode.workers.dev/contact.html)
