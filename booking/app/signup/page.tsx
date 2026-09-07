import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth-forms";
import { MarketingHeader } from "@/components/marketing-header";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Create a workspace" };

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-dvh">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-md px-5 py-16">
        <h1 className="font-display text-4xl">Create your booking workspace</h1>
        <p className="mt-2 mb-8 text-muted">One business per account. You can embed the widget the moment you add a service.</p>
        <div className="surface rounded-3xl p-6">
          <SignupForm />
        </div>
      </main>
    </div>
  );
}
