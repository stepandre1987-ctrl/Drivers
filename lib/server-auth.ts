// lib/server-auth.ts
import "server-only";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

/**
 * Vše důležité pro NextAuth načítáme AŽ za běhu.
 * ŽÁDNÝ statický import z "next-auth" ani z "next-auth/providers/..."
 */
export async function getAuthOptions() {
  // dynamicky natáhneme next-auth Google provider
  const GoogleModule = await import("next-auth/providers/google");
  const GoogleProvider = GoogleModule.default;

  return {
    adapter: PrismaAdapter(prisma),
    session: { strategy: "database" as const },
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!
      })
    ],
    callbacks: {
      // any typování kvůli runtime importu (bez typů z next-auth)
      session: async ({ session, user }: any) => {
        if (session.user) (session.user as any).id = user.id;
        return session;
      }
    }
  } as any;
}

/** Kompatibilní helper `auth()` – taky dynamicky */
export async function auth() {
  const { getServerSession } = await import("next-auth");
  return getServerSession(await getAuthOptions());
}
