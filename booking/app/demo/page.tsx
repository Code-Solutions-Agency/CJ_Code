import type { Metadata } from "next";
import Link from "next/link";
import { BookingWidget } from "@/components/booking-widget";
import { MarketingFooter, MarketingHeader } from "@/components/marketing-header";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Willow & Grove demo" };

export default async function DemoPage() {
  const session = await getSession();

  return (
    <div className="min-h-dvh">
      <MarketingHeader signedIn={Boolean(session)} />
      <main className="mx-auto w-full max-w-5xl px-5 py-12">
        <p className="text-sm uppercase tracking-[0.16em] text-sage">Client site preview</p>
        <h1 className="mt-2 font-display text-5xl">Willow & Grove</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          A nursery site with Booklane dropped in. This is the seeded demo tenant — the same widget a customer would
          paste onto their own domain.
        </p>
        <p className="mt-3 text-sm text-faint">
          After you book, sign in as <strong>demo@booklane.dev</strong> to see it on the dashboard.
        </p>
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-4 text-muted">
            <p>
              Spring beds are filling. Book a consult or a site visit and we will map soil, sun, and a delivery window.
            </p>
            <p>Hours: Monday–Friday 9–5, Saturday 10–2, Eastern time.</p>
            <Link href="/signup" className="inline-flex text-accent underline-offset-2 hover:underline">
              Put this widget on your site
            </Link>
          </aside>
          <BookingWidget publicKey="pk_demo_willow_grove" />
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
