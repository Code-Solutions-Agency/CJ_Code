# One-time FAQ chatbot: pitch and handoff

Fixed-scope add-on for an existing website. The buyer pays once and receives the files. This is an ownership transfer, not a subscription.

Cedar Lane Studio in the sample files is fictional. Swap it for the client's business before you deliver. The widget is not PrattWorks, and it is not the CJ Code marketing site.

## Paste this into Upwork or Fiverr

I'll add a small FAQ and booking chatbot to your existing website. Fixed scope, one-time price (a typical range for this package is $300 to $450). You get the HTML, CSS, and JavaScript files, and full rights to that delivered code for your business after you pay. I place a short snippet before the closing body tag and fill in your business name, color, FAQ answers, and booking or contact link.

The bot answers from the FAQ we write. It does not use a paid AI API, so there is no monthly model bill. It is not a WordPress plugin and not a Shopify app. The booking button opens your link, contact page, or email. It is not a full booking-calendar install.

Not included unless we write it into the order: hosting, ongoing edits, a second website, or a support retainer.

Shorter version:

One-time FAQ chatbot for your site. You own the files after payment. Scripted answers for hours, services, and how to book, plus a Book a call button to your link. No monthly fee. Not a WordPress plugin.

## Files included

| File | Role |
| --- | --- |
| `faq-chatbot.js` | The widget. Paste a script tag that loads this. |
| `faq-chatbot.css` | Styles. Must stay in the same folder as the script. The script loads it. |
| `sample-config.js` | Business name, color, FAQ, and booking link. Edit this per client. |
| `demo.html` | Proposal preview. Open it locally, or host this folder later. Not required on the buyer's live site. |
| `INSTALL.md` | Exact paste snippet and config keys. |
| `HANDOFF.md` | This note. |
| `README.md` | Seller checklist. You can leave it out of the buyer zip. |

No third-party libraries. No API keys. No admin login. Editing `sample-config.js` (or the inline config) is the handoff.

## What the buyer owns after payment

Send this, and keep it aligned with the invoice:

After the project price is paid in full, you own the delivered files for your business. You may use them, edit them, and host them on your website. Full rights to that delivered code for your business. This is a one-time ownership transfer. It is not a subscription, and it does not expire. CJ Code does not charge a monthly fee for the widget and does not take the files back.

There is no separate admin account to transfer. You change answers, the color, and the booking link in the config.

Suggested timing, matching the usual project terms: hand off the files and this note when the balance is paid.

This is not a license to resell the chatbot as a product for other businesses, and it is not a copy of the CJ Code marketing site or other CJ Code products.

## Out of scope

Unless a written order adds them:

- Hosting the website
- A monthly subscription, retainer, or support plan
- LLM or other API fees (this bot does not call one)
- A multi-site license (one business site per delivery)
- A WordPress plugin or a Shopify app
- Installing a full booking system such as Booklane (the button only opens a link the client already has)
- Unlimited FAQ writing, or a custom model
- Edits after handoff

## Install: you, or the buyer

You install (usual, inside the fixed price):

1. Get the business name, a hex color, the FAQ, and a booking or contact URL (`https://...`, a path like `/contact`, or `mailto:...`).
2. Edit `sample-config.js`. Set `samplePreview` to `false`.
3. Upload `faq-chatbot.js`, `faq-chatbot.css`, and `sample-config.js` into one public folder.
4. Paste the snippet from `INSTALL.md` before `</body>`.
5. Click every FAQ chip and click Book a call.

Buyer self-install:

Same steps, from `INSTALL.md`. Send the three code files plus `INSTALL.md` and this handoff. They paste the snippet themselves.

## Customize the FAQ and the booking link

Open `sample-config.js`.

- `businessName`: the client's name.
- `accentColor`: hex only, such as `#1d6a4f`.
- `bookingUrl`: where Book a call goes.
- `faqs`: each entry needs `q` (the question), `a` (the answer), and `keywords` (words a visitor might type).
- Put `{{businessName}}` in an answer if the name should update in one place.

The list replaces the small built-in backup. It does not merge with it. Keep answers in the client's voice. Do not promise prices, timelines, or results you did not write down.

On a proposal page, `demo.html` forces `samplePreview` and points Book a call at `#book`. That override is only on the demo page. The live snippet should use the client's real URL and `samplePreview: false`.

## Honesty

The bot is scripted. It matches keywords. It does not call a paid language model. If you show `demo.html` in public, leave the sample-preview label on. The starter copy is a fictional studio so a prospect can click around. Say that in the proposal.

Tone for the answers: plain and warm. No em dashes in the customer-facing bot copy.
