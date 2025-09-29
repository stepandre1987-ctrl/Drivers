import { auth } from "@/lib/auth";

export async function requireRole(roles: ("ADMIN"|"ACCOUNTANT")[]) {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  if (!role || !roles.includes(role as any)) {
    return { allowed: false, status: 403, message: "Forbidden" } as const;
  }
  return { allowed: true, session } as const;
}
