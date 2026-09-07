import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "./session";

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireApiSession(): Promise<SessionUser | Response> {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }
  return session;
}

export function isSession(value: SessionUser | Response): value is SessionUser {
  return !(value instanceof Response);
}
