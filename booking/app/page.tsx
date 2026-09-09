import Link from "next/link";
import { BookingWidget } from "@/components/booking-widget";
import { MarketingFooter, MarketingHeader } from "@/components/marketing-header";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingHeader signedIn={Boolean(session)} />
      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-accent">CJ Code · Booklane</p>
            <h1 className="mt-3 font-display text-5xl leading-[1.1] sm:text-6xl">
              Booking that lives on your website, not a separate tab.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              Businesses sign up, set services and weekly hours, then paste a small snippet. Visitors pick a real
              opening — duration and existing appointments already counted — and the workspace gets the booking.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink">
                Start free
              </Link>
              <Link href="/demo" className="rounded-full border border-line bg-bg-2 px-5 py-2.5 text-sm font-medium">
                See it on a site
              </Link>
            </div>
            <p className="mt-4 text-sm text-faint">
              Demo workspace: demo@booklane.dev / DemoPass123!
            </p>
          </div>
          <BookingWidget publicKey="pk_demo_willow_grove" />
        </section>

        <section id="how" className="border-y border-line bg-bg-2/70 py-16">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create a workspace",
                body: "Sign up with email and password. Each business is its own tenant — services, hours, and bookings never mix.",
              },
              {
                step: "02",
                title: "Set what you offer",
                body: "Add services with duration and optional price, then weekly hours. Brand the widget with your color.",
              },
              {
                step: "03",
                title: "Paste the snippet",
                body: "Drop the script on any page. Visitors book in place. You see the appointment on the dashboard.",
              },
            ].map((item) => (
              <article key={item.step} className="rounded-3xl border border-line bg-bg p-6">
                <p className="text-xs tracking-[0.16em] text-accent">{item.step}</p>
                <h2 className="mt-2 font-display text-2xl">{item.title}</h2>
                <p className="mt-3 text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-16">
          <h2 className="font-display text-4xl">Built to sell as a multi-tenant service</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              ["Tenant-scoped API", "Admin routes read the signed-in workspace. Public routes resolve only by that tenant’s public key."],
              ["Real availability", "Openings come from weekly hours, service length, and confirmed bookings — not a static calendar."],
              ["Embed-friendly", "Iframe + script install. Public APIs send CORS headers. The embed route allows framing from any site."],
              ["Email when it books", "Visitor confirmation and business notice via Resend, or a console stub when keys are missing."],
            ].map(([title, body]) => (
              <article key={title} className="rounded-3xl border border-line bg-bg-2/80 p-6">
                <h3 className="font-medium">{title}</h3>
                <p className="mt-2 text-muted">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
