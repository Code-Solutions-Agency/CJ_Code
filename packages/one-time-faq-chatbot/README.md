# One-time FAQ chatbot

A fixed-scope chatbot Caitlin can sell once, then hand over. The buyer gets the files and full rights to that code for their business after they pay. Not a subscription, not a plugin, not a multi-tenant app.

Open `demo.html` in a browser (double-click, or any static server). It is a fictional studio, labeled as a sample preview. Nothing in this folder is wired into the CJ Code homepage.

Pitch and ownership language: [HANDOFF.md](HANDOFF.md). Paste snippet: [INSTALL.md](INSTALL.md).

## Reskin for a gig

1. Edit `sample-config.js` (name, hex color, FAQ, booking URL).
2. Set `samplePreview` to `false` for the live site.
3. Open `demo.html` only to rehearse. The live site uses the snippet in `INSTALL.md`, not this demo page.
4. Click every chip, ask an off-topic question, and click Book a call.
5. Zip the folder, or send `faq-chatbot.js`, `faq-chatbot.css`, `sample-config.js`, `INSTALL.md`, and `HANDOFF.md`.

`faqs` in the config replaces the whole list. `{{businessName}}` in an answer is filled in by the widget.

Typical fixed price for this scope: $300 to $450. The gig blurb is in `HANDOFF.md`.

## What the widget does

- Corner launcher, FAQ chips, and a text field
- Keyword answers from the config (no API key)
- A Book a call button for an `https` link, a site path, a `#anchor`, or `mailto:`
- Accent color from `accentColor`
- A sample-preview label when `samplePreview` is true

Built-in backup answers are generic and only run if `faqs` is missing. A real delivery should set `faqs`.

## Leave the marketing site alone

Do not add this package to `index.html`, `contact.html`, or the portfolio stylesheet. Host `demo.html` from this folder if you want a proposal link later.
