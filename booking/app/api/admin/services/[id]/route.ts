import { isSession, requireApiSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { jsonError, readJson } from "@/lib/utils";
import { serviceUpdateSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

async function loadOwnedService(tenantId: string, id: string) {
  return prisma.service.findFirst({ where: { id, tenantId } });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await context.params;
  const existing = await loadOwnedService(session.tenantId, id);
  if (!existing) return jsonError("Service not found", 404);

  const body = await readJson(request);
  const parsed = serviceUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid service");
  }

  const service = await prisma.service.update({
    where: { id },
    data: parsed.data,
  });
  return Response.json({ service });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await context.params;
  const existing = await loadOwnedService(session.tenantId, id);
  if (!existing) return jsonError("Service not found", 404);

  const booked = await prisma.booking.count({ where: { serviceId: id } });
  if (booked > 0) {
    const service = await prisma.service.update({
      where: { id },
      data: { active: false },
    });
    return Response.json({ service, deactivated: true });
  }

  await prisma.service.delete({ where: { id } });
  return Response.json({ ok: true });
}
