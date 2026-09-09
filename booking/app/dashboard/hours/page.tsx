import type { Metadata } from "next";
import { HoursForm } from "@/components/hours-form";
import { requireSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Hours" };

export default async function HoursPage() {
  const session = await requireSession();
  const rules = await prisma.availabilityRule.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { dayOfWeek: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl">Weekly hours</h1>
        <p className="mt-2 text-muted">
          One window per day. The widget offers start times every 15 minutes that still fit the service length.
        </p>
      </div>
      <HoursForm initial={rules} />
    </div>
  );
}
