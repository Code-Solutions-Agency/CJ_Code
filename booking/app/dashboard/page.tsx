import type { Metadata } from "next";
import { DateTime } from "luxon";
import { BookingsTable } from "@/components/bookings-table";
import { requireSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Bookings" };

export default async function DashboardPage() {
  const session = await requireSession();
  const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });
  if (!tenant) return null;

  const startOfToday = DateTime.now().setZone(tenant.timezone).startOf("day").toUTC().toJSDate();
  const [bookings, serviceCount, weekCount] = await Promise.all([
    prisma.booking.findMany({
      where: { tenantId: tenant.id, status: "CONFIRMED", startAt: { gte: startOfToday } },
      include: { service: { select: { name: true, durationMinutes: true } } },
      orderBy: { startAt: "asc" },
      take: 50,
    }),
    prisma.service.count({ where: { tenantId: tenant.id, active: true } }),
    prisma.booking.count({
      where: {
        tenantId: tenant.id,
        status: "CONFIRMED",
        startAt: {
          gte: DateTime.now().setZone(tenant.timezone).startOf("week").toUTC().toJSDate(),
          lte: DateTime.now().setZone(tenant.timezone).endOf("week").toUTC().toJSDate(),
        },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Upcoming bookings</h1>
        <p className="mt-2 text-muted">
          Times are in {tenant.timezone.replace(/_/g, " ")}. Cancelled slots free up on the widget immediately.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-faint">Upcoming</p>
          <p className="mt-1 font-display text-3xl">{bookings.length}</p>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-faint">This week</p>
          <p className="mt-1 font-display text-3xl">{weekCount}</p>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-faint">Active services</p>
          <p className="mt-1 font-display text-3xl">{serviceCount}</p>
        </div>
      </div>
      <div className="surface rounded-3xl p-5">
        <BookingsTable
          bookings={bookings.map((booking) => ({
            ...booking,
            startAt: booking.startAt.toISOString(),
          }))}
          timezone={tenant.timezone}
        />
      </div>
    </div>
  );
}
