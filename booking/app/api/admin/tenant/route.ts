import { isSession, requireApiSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { jsonError, readJson } from "@/lib/utils";
import { tenantUpdateSchema } from "@/lib/validators";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
  });
  if (!tenant) return jsonError("Workspace not found", 404);
  return Response.json({ tenant });
}

export async function PATCH(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = await readJson(request);
  const parsed = tenantUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid settings");
  }

  const tenant = await prisma.tenant.update({
    where: { id: session.tenantId },
    data: {
      name: parsed.data.name,
      timezone: parsed.data.timezone,
      primaryColor: parsed.data.primaryColor,
      notifyEmail: parsed.data.notifyEmail || session.email,
    },
  });

  return Response.json({ tenant });
}
