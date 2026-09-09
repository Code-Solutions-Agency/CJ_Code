import Link from "next/link";

export function Wordmark({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link
      href={href}
      className={`font-display text-xl tracking-tight ${light ? "text-accent-ink" : "text-ink"}`}
    >
      Booklane
    </Link>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-faint">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-line bg-bg-2 px-3 py-2.5 text-ink outline-none ring-accent/20 transition focus:border-accent focus:ring-4 ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-line bg-bg-2 px-3 py-2.5 text-ink outline-none ring-accent/20 transition focus:border-accent focus:ring-4 ${props.className ?? ""}`}
    />
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-full border border-line bg-bg-2 px-5 py-2.5 text-sm font-medium text-ink transition hover:border-accent/40 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function Banner({
  children,
  tone = "error",
}: {
  children: React.ReactNode;
  tone?: "error" | "ok";
}) {
  return (
    <p
      className={`rounded-xl px-3 py-2 text-sm ${
        tone === "ok" ? "bg-sage/20 text-ink" : "bg-red-50 text-red-800"
      }`}
    >
      {children}
    </p>
  );
}
