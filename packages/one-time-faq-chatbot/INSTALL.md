# Install the FAQ chatbot

One-time drop-in. No plugin, no app store, no API key.

The chat answers from the FAQ in `sample-config.js`. Book a call opens a link you set. It does not install a booking calendar.

## Files to upload

Put these three files in one public folder. The CSS file must sit next to the JavaScript file. The script loads it.

```
faq-chatbot.js
faq-chatbot.css
sample-config.js
```

`demo.html` is the proposal preview. Do not upload it to the client's live site unless they want that sample page.

## Paste this before `</body>`

Change `/faq-chatbot/` if you used a different folder name.

```html
<script src="/faq-chatbot/sample-config.js"></script>
<script src="/faq-chatbot/faq-chatbot.js"></script>
```

The stylesheet is not in the snippet. `faq-chatbot.js` loads `faq-chatbot.css` from the same folder.

Set `samplePreview` to `false` in `sample-config.js` on the live site. The proposal demo turns it on so the widget says "Sample preview".

## Where to paste it

Any site that lets you add HTML before `</body>`:

- A plain HTML page
- A theme footer (Shopify `theme.liquid`, a Webflow footer embed, a Squarespace code injection)
- A WordPress footer HTML slot or a child theme, if that is how the site is built

This delivery is still the same two script tags. It is not a WordPress plugin and not a Shopify app.

## Inline config

Use this when the host only gives you one HTML box and you would rather not load `sample-config.js`. Copy the object from `sample-config.js` into the first script. Keep `faq-chatbot.css` beside `faq-chatbot.js`.

```html
<script>
  window.FAQ_CHAT = {
    businessName: "Cedar Lane Studio",
    accentColor: "#1d6a4f",
    bookingUrl: "https://example.com/book",
    bookingLabel: "Book a call",
    samplePreview: false,
    faqs: [
      {
        q: "What are your hours?",
        keywords: ["hours", "open", "closed", "saturday", "sunday"],
        a: "{{businessName}} is open Tuesday to Friday, 10am to 5pm, and Saturday, 10am to 2pm. We are closed Sunday and Monday."
      }
    ]
  };
</script>
<script src="/faq-chatbot/faq-chatbot.js"></script>
```

Replace that single FAQ with the full list from `sample-config.js` before you deliver.

## Config keys

| Key | Required | What to put |
| --- | --- | --- |
| `businessName` | yes | The client's business name |
| `accentColor` | yes | A hex color, like `#1d6a4f` |
| `bookingUrl` | yes | `https://...`, `/contact`, `#book`, or `mailto:hello@example.com` |
| `bookingLabel` | no | Button text. Default: `Book a call` |
| `faqs` | yes for a real gig | List of `{ q, a, keywords }`. Replaces the built-in backup list. It does not merge. |
| `quickReplies` | no | Short chip labels. Defaults to the first four questions. |
| `greeting` | no | First message when the chat opens. |
| `fallback` | no | Used when nothing in the FAQ matches. |
| `nudge` | no | Reply to hello. |
| `launcherLabel` | no | Corner button. Default: `Ask a question` |
| `inputPlaceholder` | no | Text inside the empty field. |
| `samplePreview` | no | `true` only on a public sample. `false` on the live site. |
| `autoOpen` | no | `true` opens the panel on wide screens. Leave `false` on a live site unless the client asks. |

`{{businessName}}` inside `greeting`, `fallback`, `nudge`, or an answer is replaced with the business name.

`bookingUrl` only accepts `http`, `https`, a same-site path, a simple `#anchor`, or `mailto:`. Other values are ignored and the button is hidden.

## Check before you send it

1. Open the page.
2. Click each suggested question.
3. Ask something that is not in the FAQ. You should get the fallback, not a made-up answer.
4. Click Book a call. It should open the client's link, contact page, or email draft.
5. Confirm the widget does not say "Sample preview" on the live site.

A page button can open the chat:

```html
<button type="button" data-faq-chat-open>Ask a question</button>
<button type="button" data-faq-chat-open data-faq-chat-ask="What are your hours?">Hours</button>
```

## Who does this

Caitlin can upload the files and paste the snippet as part of the gig.

The buyer can do the same steps from this file if they would rather place it themselves. Same files either way.
