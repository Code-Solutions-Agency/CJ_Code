"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wordmark } from "./brand";

const links = [
  { href: "/dashboard", label: "Bookings" },
  { href: "/dashboard/services", label: "Services" },
  { href: "/dashboard/hours", label: "Hours" },
  { href: "/dashboard/settings", label: "Business" },
  { href: "/dashboard/embed", label: "Embed" },
];

export function DashboardShell({
  businessName,
  children,
}: {
  businessName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-bg-2/80 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Wordmark href="/dashboard" />
          <p className="hidden pt-2 text-sm text-muted lg:block">{businessName}</p>
        </div>
        <nav className="flex gap-1 overflow-auto px-3 pb-3 lg:flex-col lg:px-4">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-2 text-sm whitespace-nowrap ${
                  active ? "bg-accent text-accent-ink" : "text-muted hover:bg-bg-3 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            className="rounded-full px-3 py-2 text-left text-sm text-muted hover:bg-bg-3 hover:text-ink"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
              router.refresh();
            }}
          >
            Sign out
          </button>
        </nav>
      </aside>
      <div className="px-5 py-8 lg:px-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </div>
    </div>
  );
}
