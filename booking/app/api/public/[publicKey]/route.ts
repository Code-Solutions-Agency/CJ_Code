import { corsOptions, publicError, publicJson } from "@/lib/cors";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ publicKey: string }> };

export function OPTIONS() {
  return corsOptions();
}

export async function GET(_request: Request, context: RouteContext) {
  const { publicKey } = await context.params;
  const tenant = await prisma.tenant.findUnique({
    where: { publicKey },
    select: {
      name: true,
      timezone: true,
      primaryColor: true,
      publicKey: true,
      services: {
        where: { active: true },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          durationMinutes: true,
          priceCents: true,
        },
      },
      availability: {
        orderBy: { dayOfWeek: "asc" },
        select: { dayOfWeek: true, startMinute: true, endMinute: true },
      },
    },
  });

  if (!tenant) return publicError("Booking page not found", 404);
  return publicJson({ tenant });
}
