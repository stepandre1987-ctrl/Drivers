import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const session = await auth();
    const role = (session?.user as any)?.role as string | undefined;
    if (!session || !role || (role !== "ADMIN" && role !== "ACCOUNTANT")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
