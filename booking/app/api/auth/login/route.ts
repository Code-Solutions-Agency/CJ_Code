import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setSessionCookie } from "@/lib/session";
import { jsonError, readJson } from "@/lib/utils";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Enter a valid email and password");
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user) {
    return jsonError("Email or password is incorrect", 401);
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    return jsonError("Email or password is incorrect", 401);
  }

  await setSessionCookie({
    id: user.id,
    email: user.email,
    name: user.name,
    tenantId: user.tenantId,
  });

  return Response.json({
    user: { id: user.id, email: user.email, name: user.name, tenantId: user.tenantId },
  });
}
