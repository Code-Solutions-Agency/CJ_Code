import { isSession, requireApiSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { jsonError, readJson } from "@/lib/utils";
import { serviceCreateSchema } from "@/lib/validators";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const services = await prisma.service.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: "asc" },
  });
  return Response.json({ services });
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = await readJson(request);
  const parsed = serviceCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid service");
  }

  const service = await prisma.service.create({
    data: {
      tenantId: session.tenantId,
      name: parsed.data.name,
      durationMinutes: parsed.data.durationMinutes,
      priceCents: parsed.data.priceCents ?? null,
    },
  });

  return Response.json({ service }, { status: 201 });
}
