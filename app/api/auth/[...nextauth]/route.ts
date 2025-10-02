export const runtime = "nodejs";

import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/server-auth";

// Exportujeme GET/POST jako async a předáme NextAuth až s připravenými options
export async function GET(req: Request, ctx: any) {
  const handler = NextAuth(await getAuthOptions());
  // @ts-ignore – typy route handleru NextAuth v4 tu haprují, runtime je OK
  return handler(req, ctx);
}

export async function POST(req: Request, ctx: any) {
  const handler = NextAuth(await getAuthOptions());
  // @ts-ignore
  return handler(req, ctx);
}
