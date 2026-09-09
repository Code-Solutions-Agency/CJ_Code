import { isSession, requireApiSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { jsonError, readJson } from "@/lib/utils";
import { availabilitySchema } from "@/lib/validators";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const rules = await prisma.availabilityRule.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { dayOfWeek: "asc" },
  });
  return Response.json({ rules });
}

export async function PUT(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = await readJson(request);
  const parsed = availabilitySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid hours");
  }

  const enabled = parsed.data.rules.filter((rule) => rule.enabled);

  const rules = await prisma.$transaction(async (tx) => {
    await tx.availabilityRule.deleteMany({ where: { tenantId: session.tenantId } });
    if (enabled.length === 0) return [];
    await tx.availabilityRule.createMany({
      data: enabled.map((rule) => ({
        tenantId: session.tenantId,
        dayOfWeek: rule.dayOfWeek,
        startMinute: rule.startMinute,
        endMinute: rule.endMinute,
      })),
    });
    return tx.availabilityRule.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { dayOfWeek: "asc" },
    });
  });

  return Response.json({ rules });
}
