export const runtime = "nodejs";

import NextAuth from "next-auth";
import { authOptions } from "@/lib/server-auth"; // << sem
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
