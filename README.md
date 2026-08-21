# Web and AI Services Portfolio

CJ Code portfolio site for agencies and companies: website design, redesign, updates and maintenance, AI automation, chatbots, and workflow integration.

Static HTML/CSS/JS. No build step.

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

## Contact email

The form lives on `contact.html`. It opens a `mailto:` draft. Change the address in `js/config.js`:

```js
contactEmail: "hello@cjcode.com",
```

## Chat demo

The corner widget is a scripted assistant about these services. Nothing is sent to a server. Swap the replies in `js/app.js` when you wire a real model later.

## Portfolio demos (Projects 2 and 3)

Click **Try Demo** on a work card. Both tools are walkthroughs, not free products:

- Sample inputs only (no pasting a real customer email or a real project request)
- Two generates per demo, per browser
- Output is marked as a demo sample
- No copy button for a sendable reply or a usable client brief

Change the generate cap in `js/config.js` (`demoMaxUses`). Do not put an API key in the frontend.
