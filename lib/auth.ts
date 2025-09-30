import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authConfig: NextAuthConfig = {
  // v5: adapter z @auth/prisma-adapter má jiné typy; přetypujeme na any, ať build projde
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ]
};

// v5 exportuje helpers z NextAuth(config)
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
