import type { Metadata } from "next";
import { SettingsForm } from "@/components/settings-form";
import { requireSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Business" };

export default async function SettingsPage() {
  const session = await requireSession();
  const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });
  if (!tenant) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl">Business</h1>
        <p className="mt-2 text-muted">Name, timezone, and brand color are what visitors see on the widget.</p>
      </div>
      <SettingsForm
        initial={{
          name: tenant.name,
          timezone: tenant.timezone,
          primaryColor: tenant.primaryColor,
          notifyEmail: tenant.notifyEmail,
        }}
      />
    </div>
  );
}
