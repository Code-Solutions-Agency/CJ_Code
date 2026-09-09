# Web and AI Services Portfolio

CJ Code portfolio site for agencies and companies: website design, redesign, updates and maintenance, AI automation, chatbots, and workflow integration.

Static HTML/CSS/JS. No build step.

## Open locally

1. Open `index.html` in a browser (double-click, or drag it into Chrome/Edge).
2. Optional, from this folder:

```bash
npx --yes serve .
```

Then visit the URL it prints (usually `http://localhost:3000`). Serving over http(s) is required if you want to test chat lead submit (FormSubmit rejects `file://`).

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

## Contact email

The form lives on `contact.html`. It opens a `mailto:` draft. Change the address in `js/config.js`:

```js
contactEmail: "hello@cjcode.com",
```

## Chat widget

The corner widget answers from a script in `js/app.js` (design, redesign, maintenance, automation, chatbots, workflows). Answers stay on the page.

**Get a reply** sends name, email, an optional note, and a short transcript to `contactEmail` through a public form endpoint — no private API key in the frontend.

Default endpoint is FormSubmit.co AJAX (`https://formsubmit.co/ajax/{contactEmail}`). Override it with `leadEndpoint` in `js/config.js` if you use a FormSubmit random-string URL or another public form backend.

### One-time FormSubmit activation

1. Serve the site over http(s) (not `file://`) and submit a test lead.
2. FormSubmit emails a confirmation link to `contactEmail`. Click it once.
3. Later leads arrive as email. FormSubmit will not work from a double-clicked HTML file.

If the browser cannot reach the endpoint, the widget offers a `mailto:` draft to the same address, prefilled with the lead and transcript.

## Portfolio demos (Projects 2 and 3)

Click **Try Demo** on a work card. Both tools are walkthroughs, not free products:

- Sample inputs only (no pasting a real customer email or a real project request)
- Two generates per demo, per browser
- Output is marked as a demo sample
- No copy button for a sendable reply or a usable client brief

Change the generate cap in `js/config.js` (`demoMaxUses`). Do not put an API key in the frontend.
