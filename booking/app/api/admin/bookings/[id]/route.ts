import { isSession, requireApiSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { status?: string } | null;
  if (body?.status !== "CANCELLED") {
    return jsonError("Only cancellation is supported");
  }

  const existing = await prisma.booking.findFirst({
    where: { id, tenantId: session.tenantId },
  });
  if (!existing) return jsonError("Booking not found", 404);

  const booking = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: { service: { select: { name: true, durationMinutes: true } } },
  });

  return Response.json({ booking });
}
