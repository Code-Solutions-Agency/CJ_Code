import { DashboardShell } from "@/components/dashboard-shell";
import { requireSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });

  return <DashboardShell businessName={tenant?.name || "Workspace"}>{children}</DashboardShell>;
}
