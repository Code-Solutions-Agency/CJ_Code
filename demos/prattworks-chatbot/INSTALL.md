# PrattWorks shopper assistant — install

Capped **demo preview** for PrattWorks shoppers (order tracking, sizes, wraps, personalization). Not a free production bot. No API keys, no live inventory, no payments.

Shop name is **PrattWorks** (one word, capital P and W).

## Try it first

Live demo storefront (after merge to `master`):

https://code-solutions-agency.github.io/CJ_Code/demos/pratt-works.html

Until then, the PR preview:

https://cursor-pratt-works-chatbot-demo-f848-www.cjcode.workers.dev/demos/pratt-works.html

## What to send a client

Email **this folder** (`demos/prattworks-chatbot/`), not the whole CJ Code portfolio.

```
prattworks-chatbot.js
prattworks-chatbot.css
INSTALL.md   ← this file
```

## Paste into their site

Copy the folder onto the site (any public path). Then add **one script** before `</body>` — the script loads the CSS next to it:

```html
<script>
  window.PRATTWORKS_CHAT = {
    shopName: "PrattWorks",
    contactHref: "/contact", // or a mailto: / CJ Code contact URL
  };
</script>
<script src="/prattworks-chatbot/prattworks-chatbot.js"></script>
```

Change `/prattworks-chatbot/` to wherever you put the files.

If you have repo access instead of a zip: add the same two files and the snippet above.

Optional remote demo (GitHub Pages, after merge) — preview only, still capped:

```html
<script src="https://code-solutions-agency.github.io/CJ_Code/demos/prattworks-chatbot/prattworks-chatbot.js"></script>
```

## Optional config

Set `window.PRATTWORKS_CHAT` **before** the script:

| Key | Default | Notes |
| --- | --- | --- |
| `shopName` | `PrattWorks` | Chat header |
| `contactHref` | empty | CTA link when the preview cap hits |
| `contactLabel` | `Ask CJ Code to build the full bot` | CTA text |
| `autoOpenDesktop` | `true` | Opens on wide screens so a prospect sees it |

## Caps (on purpose)

- 8 questions per visit
- 2 sample stock checks
- One sample order ID: `PW-4821`
- Refreshing the page resets the preview

A production bot from CJ Code would use the shop’s real inventory, every order, and their FAQs.

## What it answers

Shoppers only: sample order tracking, tumbler sizes, which wraps are in this demo, personalization on select listings (not full custom), and a short “wash as usual” note if someone asks about care.

It does **not** quote shipping times or take custom design requests.
