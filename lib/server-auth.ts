// lib/server-auth.ts
import "server-only";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

/**
 * NextAuth v4 konfigurace – bez typů z "next-auth", aby se nic z něj
 * nenačetlo na top-levelu při buildu. Typování doplníme později.
 */
export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" as const },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    // Pozn.: any -> kvůli absenci typů z next-auth
    session: async ({ session, user }: any) => {
      if (session.user) (session.user as any).id = user.id;
      return session;
    }
  }
} as any;

/**
 * Kompatibilní helper pro starší kód `{ auth }` – dynamický import,
 * takže se "next-auth" nenačítá při buildu.
 */
export async function auth() {
  const { getServerSession } = await import("next-auth");
  return getServerSession(authOptions);
}

