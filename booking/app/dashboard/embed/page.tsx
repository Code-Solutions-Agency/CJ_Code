import type { Metadata } from "next";
import { EmbedPanel } from "@/components/embed-panel";
import { requireSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Embed" };

export default async function EmbedPage() {
  const session = await requireSession();
  const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });
  if (!tenant) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl">Embed</h1>
        <p className="mt-2 text-muted">
          This snippet is scoped to <strong>{tenant.name}</strong>. Other workspaces have their own public key.
        </p>
      </div>
      <EmbedPanel publicKey={tenant.publicKey} />
    </div>
  );
}
