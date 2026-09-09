import type { Metadata } from "next";
import { LoginForm } from "@/components/auth-forms";
import { MarketingHeader } from "@/components/marketing-header";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-dvh">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-md px-5 py-16">
        <h1 className="font-display text-4xl">Welcome back</h1>
        <p className="mt-2 mb-8 text-muted">Use the demo account or your own workspace.</p>
        <div className="surface rounded-3xl p-6">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
