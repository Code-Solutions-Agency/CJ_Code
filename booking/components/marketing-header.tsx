import Link from "next/link";
import { Wordmark } from "./brand";

export function MarketingHeader({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-[rgba(251,247,240,0.86)] backdrop-blur">
      <div className="mx-auto flex h-[4.25rem] w-full max-w-6xl items-center justify-between px-5">
        <Wordmark />
        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          <Link href="/#how" className="hidden text-muted hover:text-ink sm:inline">
            How it works
          </Link>
          <Link href="/demo" className="hidden text-muted hover:text-ink sm:inline">
            Live demo
          </Link>
          {signedIn ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-accent px-4 py-2 font-medium text-accent-ink"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-2 text-muted hover:text-ink">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-accent px-4 py-2 font-medium text-accent-ink"
              >
                Start free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-line px-5 py-8 text-sm text-faint">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>Booklane by CJ Code — embeddable booking for websites.</p>
        <p>No payments, calendars, or custom domains in this MVP.</p>
      </div>
    </footer>
  );
}
