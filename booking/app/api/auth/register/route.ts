import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setSessionCookie } from "@/lib/session";
import { createPublicKey, jsonError, readJson, slugify } from "@/lib/utils";
import { registerSchema } from "@/lib/validators";

const WEEKDAY_HOURS = [1, 2, 3, 4, 5].map((dayOfWeek) => ({
  dayOfWeek,
  startMinute: 9 * 60,
  endMinute: 17 * 60,
}));

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid signup details");
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return jsonError("An account with that email already exists", 409);
  }

  let slug = slugify(parsed.data.businessName);
  const slugTaken = await prisma.tenant.findUnique({ where: { slug } });
  if (slugTaken) {
    slug = `${slug}-${crypto.randomUUID().slice(0, 6)}`;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const timezone = parsed.data.timezone ?? "America/New_York";

  const created = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: parsed.data.businessName,
        slug,
        publicKey: createPublicKey(),
        timezone,
        notifyEmail: email,
        users: {
          create: {
            email,
            name: parsed.data.name,
            passwordHash,
          },
        },
        availability: {
          create: WEEKDAY_HOURS,
        },
      },
      include: { users: true },
    });
    return tenant;
  });

  const user = created.users[0];
  if (!user) return jsonError("Could not create account", 500);

  await setSessionCookie({
    id: user.id,
    email: user.email,
    name: user.name,
    tenantId: created.id,
  });

  return Response.json({
    user: { id: user.id, email: user.email, name: user.name, tenantId: created.id },
  });
}
