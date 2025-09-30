import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);
const ACCOUNTANT_EMAILS = (process.env.ACCOUNTANT_EMAILS ?? "").split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    async signIn({ user }) {
      const email = (user.email ?? "").toLowerCase();
      if (!email) return false;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) {
        let role: "DRIVER"|"ADMIN"|"ACCOUNTANT" = "DRIVER";
        if (ADMIN_EMAILS.includes(email)) role = "ADMIN";
        else if (ACCOUNTANT_EMAILS.includes(email)) role = "ACCOUNTANT";
        await prisma.user.create({ data: { email, name: user.name ?? null, image: user.image ?? null, role } });
      } else {
        let role: "DRIVER"|"ADMIN"|"ACCOUNTANT" = existing.role as any;
        if (ADMIN_EMAILS.includes(email)) role = "ADMIN";
        else if (ACCOUNTANT_EMAILS.includes(email)) role = "ACCOUNTANT";
        else role = role === "ADMIN" || role === "ACCOUNTANT" ? role : "DRIVER";
        if (role !== existing.role) {
          await prisma.user.update({ where: { email }, data: { role } });
        }
      }
      return true;
    },
    async session({ session, user }) {
      (session.user as any).id = user.id;
      (session.user as any).role = (user as any).role;
      return session;
    },
  },
});
