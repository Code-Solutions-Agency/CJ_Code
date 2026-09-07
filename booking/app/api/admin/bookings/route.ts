import { DateTime } from "luxon";
import { isSession, requireApiSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });
  if (!tenant) {
    return Response.json({ error: "Workspace not found" }, { status: 404 });
  }

  const scope = new URL(request.url).searchParams.get("scope") || "upcoming";
  const startOfToday = DateTime.now().setZone(tenant.timezone).startOf("day").toUTC().toJSDate();

  const bookings = await prisma.booking.findMany({
    where: {
      tenantId: session.tenantId,
      ...(scope === "upcoming"
        ? { status: "CONFIRMED", startAt: { gte: startOfToday } }
        : scope === "past"
          ? { startAt: { lt: startOfToday } }
          : {}),
    },
    include: {
      service: { select: { name: true, durationMinutes: true } },
    },
    orderBy: { startAt: scope === "past" ? "desc" : "asc" },
    take: 100,
  });

  return Response.json({ bookings, timezone: tenant.timezone });
}
