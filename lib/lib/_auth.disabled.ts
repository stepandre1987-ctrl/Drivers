// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

/**
 * NextAuth v4 konfigurace – jen typový import; nic runtime z next-auth se
 * teď nenačítá na top-levelu, takže to nezkříží Edge/klienta při buildu.
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) (session.user as any).id = user.id;
      return session;
    }
  }
};

/**
 * Kompatibilní helper pro starší importy `{ auth }` – teprve zde
 * DYNAMICKY importujeme next-auth (getServerSession). Tím se
 * `next-auth/index.js` nenačte během buildu do Edge/klienta.
 */
export async function auth() {
  const { getServerSession } = await import("next-auth");
  return getServerSession(authOptions);
}
