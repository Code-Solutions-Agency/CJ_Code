import { DateTime } from "luxon";
import { corsOptions, publicError, publicJson } from "@/lib/cors";
import { prisma } from "@/lib/db";
import { generateSlots } from "@/lib/slots";

type RouteContext = { params: Promise<{ publicKey: string }> };

export function OPTIONS() {
  return corsOptions();
}

export async function GET(request: Request, context: RouteContext) {
  const { publicKey } = await context.params;
  const url = new URL(request.url);
  const serviceId = url.searchParams.get("serviceId");
  const date = url.searchParams.get("date");

  if (!serviceId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return publicError("serviceId and date (YYYY-MM-DD) are required");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { publicKey },
    include: {
      availability: true,
      services: { where: { id: serviceId, active: true } },
    },
  });
  if (!tenant || tenant.services.length === 0) {
    return publicError("Service not found", 404);
  }

  const service = tenant.services[0];
  const day = DateTime.fromISO(date, { zone: tenant.timezone });
  if (!day.isValid) return publicError("Invalid date");

  const windowStart = day.startOf("day").toUTC().toJSDate();
  const windowEnd = day.endOf("day").toUTC().toJSDate();

  const bookings = await prisma.booking.findMany({
    where: {
      tenantId: tenant.id,
      status: "CONFIRMED",
      startAt: { lt: windowEnd },
      endAt: { gt: windowStart },
    },
    select: { startAt: true, endAt: true },
  });

  const slots = generateSlots({
    dateISO: date,
    timezone: tenant.timezone,
    durationMinutes: service.durationMinutes,
    rules: tenant.availability,
    bookings,
  });

  return publicJson({
    timezone: tenant.timezone,
    durationMinutes: service.durationMinutes,
    slots,
  });
}
