# Deploy Booklane on your Render account

Apply the Blueprint from **your** Render dashboard. This repo does not have access to the account, so the web service only goes live after you click Apply.

GitHub Pages can only serve the static portfolio. Booklane (Next.js + Postgres) has to run somewhere else. Render is a good fit if you already have an account.

Free web services **sleep after ~15 minutes idle**. The first open of the contact page can take 30–60 seconds to wake (the widget retries). Free Postgres **expires after 30 days** unless you upgrade. A workspace can have **one** free Postgres database at a time.

## 1. Push this repo (already on GitHub)

Render builds from GitHub. Use branch `master` after it contains `booking/` and `render.yaml`, or point Render at `cursor/booking-saas-0fc6`.

## 2. Create from Blueprint

1. Open [Render Dashboard](https://dashboard.render.com/).
2. **New → Blueprint**.
3. Connect `Code-Solutions-Agency/CJ_Code` if it isn’t connected.
4. Select the branch that has `render.yaml` at the repo root.
5. Apply. Render creates:
   - Web service `cj-code-booklane` (root directory `booking/`)
   - Postgres `booklane-db`
6. If it asks for `RESEND_API_KEY`, leave it blank unless you want booking emails via Resend.

Wait until the web service is **Live**. Copy its URL. It should look like:

```
https://cj-code-booklane.onrender.com
```

If Render added a suffix, use the URL from the dashboard, not the guess above.

## 3. Point the portfolio at that URL

In `js/config.js`:

```js
booklaneUrl: "https://cj-code-booklane.onrender.com",
booklanePublicKey: "pk_demo_willow_grove",
```

No trailing slash. Then push to `master` so GitHub Pages updates.

## 4. Seed / sign in

The Blueprint runs `prisma db seed` on the **first** deploy. Demo login:

- `demo@booklane.dev` / `DemoPass123!`
- Public key `pk_demo_willow_grove` (the contact page uses this)

If seed didn’t run, open **Render Shell** on the web service and:

```bash
npx prisma db seed
```

## 5. Check it

1. Open `https://cj-code-booklane.onrender.com` — Booklane marketing page.
2. Open [the portfolio contact page](https://code-solutions-agency.github.io/CJ_Code/contact.html) — the widget should load (wait if the service was asleep).
3. Book a test slot, then sign in on Render and confirm it under **Bookings**.

## Later

- Custom domain on Render: set `NEXT_PUBLIC_APP_URL` to that `https://…` origin and update `booklaneUrl`.
- Paid web instance: no sleep, widget opens immediately.
- Paid Postgres: data survives past 30 days.
