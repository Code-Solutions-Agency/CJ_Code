# Install Booklane on a GitHub Pages site

Use this when a client already has (or you are building) a static site on GitHub Pages and they want the booking widget on that site.

Booklane itself is **not** hosted on Pages. Pages only serves the client’s HTML. The widget loads from the Booklane app at a public URL.

Do not deploy Booklane as part of this install. Wait until that URL exists, then paste the snippet.

## Before you start

1. Booklane is running at a public URL. Use that origin everywhere below.

   ```
   https://YOUR_BOOKLANE_URL
   ```

   No trailing slash. Example once it is live: `https://booklane.example.com`. To host Booklane on Render, follow [render-deploy.md](render-deploy.md) (this repo’s expected URL is `https://cj-code-booklane.onrender.com`).

2. The business has a Booklane workspace. In **Dashboard → Embed**, copy their public key.

   ```
   pk_THEIR_PUBLIC_KEY
   ```

3. The client site is a GitHub repo with Pages turned on (**Settings → Pages**). Typical URLs:

   - User/org site: `https://username.github.io`
   - Project site: `https://username.github.io/repo-name`

The snippet uses absolute Booklane URLs, so a project-site `/repo-name` path does not change it.

## Which snippet to use

**Script (preferred).** One tag. `widget.js` injects a sized iframe.

```html
<script
  src="https://YOUR_BOOKLANE_URL/widget.js"
  data-public-key="pk_THEIR_PUBLIC_KEY"
  async
></script>
```

**Iframe.** Use this if the site cannot load a third-party script (strict script policy, or a theme that strips `<script>`).

```html
<iframe
  src="https://YOUR_BOOKLANE_URL/embed/pk_THEIR_PUBLIC_KEY"
  title="Book an appointment"
  style="width:100%;min-height:720px;border:0;border-radius:16px;"
></iframe>
```

A ready-to-copy page lives in [`examples/github-pages-embed.html`](examples/github-pages-embed.html).

## Plain HTML site (no Jekyll)

Most small business sites on Pages are just HTML files.

1. Open the repo on GitHub (or clone it).
2. Pick the page:
   - Homepage: `index.html`
   - Dedicated booking page: add `book.html` (or put it on `contact.html`)
3. Paste the script **where the widget should appear** (inside the main column, not in `<head>`). The iframe is inserted immediately after the script tag.
4. Commit, push, wait a minute for Pages to rebuild.
5. Open the live Pages URL and confirm the Willow-style booking card loads.

Example placement:

```html
<section id="book">
  <h2>Book an appointment</h2>
  <script
    src="https://YOUR_BOOKLANE_URL/widget.js"
    data-public-key="pk_THEIR_PUBLIC_KEY"
    async
  ></script>
</section>
```

If you add `book.html`, link it from the nav: `book.html` (or `/repo-name/book.html` on a project site).

## Jekyll / theme sites

GitHub Pages often runs Jekyll. **Do not drop the snippet into a `.md` post or page and assume it will work.** Many themes (and some Markdown processors) strip or escape `<script>` and `<iframe>`.

Reliable pattern:

1. Add an include file, `_includes/booklane.html`, with **only** the snippet (script or iframe).
2. Render it from a layout or from an **HTML** page — not from Markdown.

`_includes/booklane.html`:

```html
<script
  src="https://YOUR_BOOKLANE_URL/widget.js"
  data-public-key="pk_THEIR_PUBLIC_KEY"
  async
></script>
```

A booking page that uses the theme layout, `book.html` at the site root:

```html
---
layout: default
title: Book
---
<h1>Book an appointment</h1>
{% include booklane.html %}
```

The filename must be `.html`. A `book.md` file is the usual way the snippet disappears.

If the theme has no `default` layout, use whatever layout other pages use (`page`, `compress`, etc.). Put `{% include booklane.html %}` in that layout only if every page should show the widget.

Minima / minima-like themes: page content is HTML inside the layout’s `{{ content }}`. An HTML page plus `{% include %}` is still the safe path.

## Content-Security-Policy

Booklane already allows any site to frame `/embed/*` (`frame-ancestors *`). GitHub Pages does **not** send a CSP header by default.

If the client site sets CSP — usually a `<meta http-equiv="Content-Security-Policy" ...>` in the layout — the widget will be blank until Booklane’s origin is allowed:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' https://YOUR_BOOKLANE_URL; frame-src https://YOUR_BOOKLANE_URL; img-src 'self' data:;"
/>
```

| Embed | Allow on the Pages site |
| --- | --- |
| Script | `script-src` **and** `frame-src` (or `child-src`) for `https://YOUR_BOOKLANE_URL` |
| Iframe only | `frame-src` (or `child-src`) for `https://YOUR_BOOKLANE_URL` |

Do not add `unsafe-inline` just for Booklane. The script file is hosted on Booklane; the iframe is too.

If they use Cloudflare (or similar) in front of the custom domain, check the **HTTP** CSP header there as well as any meta tag.

## Verify the install

1. Open the live Pages URL (hard-refresh if you just pushed).
2. Confirm the widget shows that tenant’s name, services, and times.
3. Book a test slot with a real email you can check.
4. Sign in to that workspace on Booklane → **Bookings**. The test appointment should be there.
5. Optional: book a second test from the Pages URL and confirm a second row. Cancel the tests from the dashboard when you are done.

If the widget is missing: view source and confirm the snippet is in the **rendered** HTML (not only in a Markdown file). If it is there but blank, check the browser console for CSP or mixed-content errors. Booklane must be `https` when the Pages site is `https`.

## Hand-off checklist

- [ ] Booklane URL and `pk_…` key filled in (not the placeholders)
- [ ] Snippet on the page they asked for (`index.html`, `book.html`, or contact)
- [ ] Jekyll sites use `_includes` + an `.html` page
- [ ] Test booking appears in that tenant’s admin (not another workspace)
