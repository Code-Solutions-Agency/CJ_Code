import { DateTime } from "luxon";
import { corsOptions, publicError, publicJson } from "@/lib/cors";
import { prisma } from "@/lib/db";
import { sendBookingEmails } from "@/lib/email";
import { slotStillOpen } from "@/lib/slots";
import { readJson } from "@/lib/utils";
import { publicBookingSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ publicKey: string }> };

export function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request, context: RouteContext) {
  const { publicKey } = await context.params;
  const body = await readJson(request);
  const parsed = publicBookingSchema.safeParse(body);
  if (!parsed.success) {
    return publicError(parsed.error.issues[0]?.message || "Invalid booking");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { publicKey },
    include: {
      availability: true,
      users: { take: 1, select: { email: true } },
    },
  });
  if (!tenant) return publicError("Booking page not found", 404);

  const service = await prisma.service.findFirst({
    where: { id: parsed.data.serviceId, tenantId: tenant.id, active: true },
  });
  if (!service) return publicError("That service is not available", 404);

  const start = DateTime.fromISO(parsed.data.startAt, { setZone: true });
  if (!start.isValid) return publicError("Invalid start time");

  const end = start.plus({ minutes: service.durationMinutes });

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const bookings = await tx.booking.findMany({
        where: {
          tenantId: tenant.id,
          status: "CONFIRMED",
          startAt: { lt: end.toUTC().toJSDate() },
          endAt: { gt: start.toUTC().toJSDate() },
        },
        select: { startAt: true, endAt: true },
      });

      const open = slotStillOpen(start.toUTC().toISO()!, {
        timezone: tenant.timezone,
        durationMinutes: service.durationMinutes,
        rules: tenant.availability,
        bookings,
      });
      if (!open) {
        throw new Error("UNAVAILABLE");
      }

      return tx.booking.create({
        data: {
          tenantId: tenant.id,
          serviceId: service.id,
          startAt: start.toUTC().toJSDate(),
          endAt: end.toUTC().toJSDate(),
          guestName: parsed.data.guestName,
          guestEmail: parsed.data.guestEmail.toLowerCase(),
          guestPhone: parsed.data.guestPhone || null,
          notes: parsed.data.notes || null,
        },
      });
    });

    const notifyEmail = tenant.notifyEmail || tenant.users[0]?.email;
    if (notifyEmail) {
      await sendBookingEmails({
        tenantName: tenant.name,
        timezone: tenant.timezone,
        serviceName: service.name,
        startAt: booking.startAt,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        notes: booking.notes,
        notifyEmail,
      }).catch((error) => {
        console.error(error);
      });
    }

    return publicJson({
      booking: {
        id: booking.id,
        startAt: booking.startAt,
        endAt: booking.endAt,
        guestName: booking.guestName,
        serviceName: service.name,
        timezone: tenant.timezone,
        tenantName: tenant.name,
      },
    }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAVAILABLE") {
      return publicError("That time is no longer available", 409);
    }
    console.error(error);
    return publicError("Could not create booking", 500);
  }
}
