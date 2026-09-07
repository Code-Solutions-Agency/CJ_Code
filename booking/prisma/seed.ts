import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DateTime } from "luxon";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "DemoPass123!";

async function upsertTenant(input: {
  name: string;
  slug: string;
  publicKey: string;
  timezone: string;
  primaryColor: string;
  notifyEmail: string;
  owner: { name: string; email: string };
  services: Array<{ name: string; durationMinutes: number; priceCents: number | null }>;
  hours: Array<{ dayOfWeek: number; startMinute: number; endMinute: number }>;
}) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const tenant = await prisma.tenant.upsert({
    where: { slug: input.slug },
    update: {
      name: input.name,
      publicKey: input.publicKey,
      timezone: input.timezone,
      primaryColor: input.primaryColor,
      notifyEmail: input.notifyEmail,
    },
    create: {
      name: input.name,
      slug: input.slug,
      publicKey: input.publicKey,
      timezone: input.timezone,
      primaryColor: input.primaryColor,
      notifyEmail: input.notifyEmail,
    },
  });

  await prisma.user.upsert({
    where: { email: input.owner.email },
    update: {
      name: input.owner.name,
      passwordHash,
      tenantId: tenant.id,
    },
    create: {
      email: input.owner.email,
      name: input.owner.name,
      passwordHash,
      tenantId: tenant.id,
    },
  });

  await prisma.booking.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.service.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.availabilityRule.deleteMany({ where: { tenantId: tenant.id } });

  await prisma.availabilityRule.createMany({
    data: input.hours.map((rule) => ({ ...rule, tenantId: tenant.id })),
  });

  const services = [];
  for (const service of input.services) {
    services.push(
      await prisma.service.create({
        data: { ...service, tenantId: tenant.id },
      }),
    );
  }

  return { tenant, services };
}

function nextWeekday(timezone: string, weekday: number, hour: number, minute = 0) {
  let day = DateTime.now().setZone(timezone).startOf("day").plus({ days: 1 });
  while (day.weekday !== weekday) {
    day = day.plus({ days: 1 });
  }
  return day.set({ hour, minute });
}

async function main() {
  const willow = await upsertTenant({
    name: "Willow & Grove",
    slug: "willow-and-grove",
    publicKey: "pk_demo_willow_grove",
    timezone: "America/New_York",
    primaryColor: "#2f5d3a",
    notifyEmail: "demo@booklane.dev",
    owner: { name: "Maya Grove", email: "demo@booklane.dev" },
    services: [
      { name: "Garden consult", durationMinutes: 30, priceCents: 4500 },
      { name: "Raised bed planning", durationMinutes: 60, priceCents: 12000 },
      { name: "On-site visit", durationMinutes: 90, priceCents: 18000 },
    ],
    hours: [
      { dayOfWeek: 1, startMinute: 9 * 60, endMinute: 17 * 60 },
      { dayOfWeek: 2, startMinute: 9 * 60, endMinute: 17 * 60 },
      { dayOfWeek: 3, startMinute: 9 * 60, endMinute: 17 * 60 },
      { dayOfWeek: 4, startMinute: 9 * 60, endMinute: 17 * 60 },
      { dayOfWeek: 5, startMinute: 9 * 60, endMinute: 17 * 60 },
      { dayOfWeek: 6, startMinute: 10 * 60, endMinute: 14 * 60 },
    ],
  });

  const consult = willow.services[0];
  const planning = willow.services[1];
  if (consult && planning) {
    const upcoming = nextWeekday(willow.tenant.timezone, 2, 10);
    const later = nextWeekday(willow.tenant.timezone, 4, 14);
    await prisma.booking.create({
      data: {
        tenantId: willow.tenant.id,
        serviceId: consult.id,
        startAt: upcoming.toUTC().toJSDate(),
        endAt: upcoming.plus({ minutes: consult.durationMinutes }).toUTC().toJSDate(),
        guestName: "Jordan Hale",
        guestEmail: "jordan@example.com",
        guestPhone: "555-0142",
        notes: "Looking at a Thursday raised-bed delivery.",
      },
    });
    await prisma.booking.create({
      data: {
        tenantId: willow.tenant.id,
        serviceId: planning.id,
        startAt: later.toUTC().toJSDate(),
        endAt: later.plus({ minutes: planning.durationMinutes }).toUTC().toJSDate(),
        guestName: "Sam Ellison",
        guestEmail: "sam@example.com",
      },
    });
  }

  await upsertTenant({
    name: "Harbor & Line",
    slug: "harbor-and-line",
    publicKey: "pk_demo_harbor_line",
    timezone: "America/Los_Angeles",
    primaryColor: "#1c4694",
    notifyEmail: "harbor@booklane.dev",
    owner: { name: "Eli Harbor", email: "harbor@booklane.dev" },
    services: [
      { name: "Studio tour", durationMinutes: 30, priceCents: 0 },
      { name: "Brand consult", durationMinutes: 45, priceCents: 15000 },
    ],
    hours: [
      { dayOfWeek: 1, startMinute: 10 * 60, endMinute: 16 * 60 },
      { dayOfWeek: 2, startMinute: 10 * 60, endMinute: 16 * 60 },
      { dayOfWeek: 3, startMinute: 10 * 60, endMinute: 16 * 60 },
      { dayOfWeek: 4, startMinute: 10 * 60, endMinute: 16 * 60 },
    ],
  });

  console.log("Seeded Booklane demo tenants.");
  console.log("  Willow & Grove  demo@booklane.dev / DemoPass123!  pk_demo_willow_grove");
  console.log("  Harbor & Line   harbor@booklane.dev / DemoPass123!  pk_demo_harbor_line");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
