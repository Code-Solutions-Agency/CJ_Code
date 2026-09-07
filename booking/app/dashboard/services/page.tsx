import type { Metadata } from "next";
import { ServicesManager } from "@/components/services-manager";
import { requireSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const session = await requireSession();
  const services = await prisma.service.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl">Services</h1>
        <p className="mt-2 text-muted">Duration drives available times. Price is optional and display-only.</p>
      </div>
      <ServicesManager initial={services} />
    </div>
  );
}
