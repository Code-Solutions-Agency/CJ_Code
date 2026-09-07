# Booklane

Embeddable booking and scheduling for websites. A business signs up, sets services and weekly hours, then pastes a snippet. Visitors book through a widget that uses real availability.

This app lives in `booking/` so the existing CJ Code portfolio site at the repo root stays as-is.

## Stack

- Next.js App Router (v16) + TypeScript + Tailwind CSS v4
- PostgreSQL via Prisma 6
- Email/password auth with signed httpOnly session cookies (`jose`)
- Multi-tenant model: `Tenant` / `User` / `Service` / `AvailabilityRule` / `Booking`
- Resend for mail when `RESEND_API_KEY` is set; otherwise emails are logged

Auth is email/password rather than magic link so the demo works without an email provider.

## Setup

PostgreSQL is required. Either install it locally or start the bundled Compose file:

```bash
cd booking
cp .env.example .env
# set AUTH_SECRET (openssl rand -base64 32)
docker compose up -d   # optional if you already have Postgres
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `AUTH_SECRET` | yes | Signs session cookies |
| `NEXT_PUBLIC_APP_URL` | yes | Public origin used in embed snippets |
| `RESEND_API_KEY` | no | Send booking mail. If empty, messages are printed to the server log |
| `EMAIL_FROM` | no | From-address for Resend |

`npm run db:setup` pushes the schema and seeds two isolated tenants.

### Demo accounts

| Workspace | Email | Password | Public key |
| --- | --- | --- | --- |
| Willow & Grove | `demo@booklane.dev` | `DemoPass123!` | `pk_demo_willow_grove` |
| Harbor & Line | `harbor@booklane.dev` | `DemoPass123!` | `pk_demo_harbor_line` |

Use Harbor & Line to confirm one tenant cannot see the other’s bookings.

## Try the end-to-end slice

1. Open `/` or `/demo` and book a Garden consult as a visitor.
2. Sign in at `/login` with `demo@booklane.dev`.
3. The new appointment appears under **Bookings**.
4. Copy the snippet from **Embed** and drop it on any HTML page.

## Embed

Script (recommended):

```html
<script
  src="http://localhost:3000/widget.js"
  data-public-key="pk_demo_willow_grove"
  async
></script>
```

Iframe:

```html
<iframe
  src="http://localhost:3000/embed/pk_demo_willow_grove"
  title="Book an appointment"
  style="width:100%;min-height:720px;border:0;border-radius:16px;"
></iframe>
```

Replace the origin with your deployed `NEXT_PUBLIC_APP_URL`.

### CORS and framing

- `/widget.js` and `/api/public/*` send `Access-Control-Allow-Origin: *`
- `/embed/*` sends `Content-Security-Policy: frame-ancestors *` so customer sites can iframe the widget
- Public APIs resolve a tenant **only** by `publicKey`. Admin APIs use the signed session and ignore any tenant id from the client

If a host site blocks third-party frames, allow this app’s origin in their CSP `frame-src` (and `script-src` if they use the script tag).

## How availability is calculated

1. Find the weekly rule for that weekday in the tenant timezone.
2. Offer start times every 15 minutes that still fit the service duration before close.
3. Skip times in the past (15-minute notice) and any window that overlaps a confirmed booking.
4. On create, the server recomputes the slot inside a transaction so two guests cannot take the same time.

## Scripts

```bash
npm run dev        # Next.js on :3000
npm run db:setup   # prisma db push + seed
npm run db:seed    # re-seed demo tenants
npm test           # slot engine unit tests
npm run lint
npm run build
```

## Out of scope (MVP)

Payments, Google Calendar, SMS, recurrence beyond weekly hours, and custom domains.
