import "./globals.css";
import { auth } from "@/lib/auth";
import Link from "next/link";

export const metadata = {
  title: "ViaPersona • Drivers",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="cs">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <header className="border-b border-neutral-800 sticky top-0 bg-neutral-950/70 backdrop-blur">
          <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
            <Link href="/" className="font-bold">ViaPersona • Driver</Link>
            <nav className="space-x-4 text-sm">
              <Link href="/">Dashboard</Link>
              <Link href="/admin">Admin</Link>
            </nav>
            <div className="text-sm opacity-80">{session?.user?.name ?? "Nepřihlášen"}</div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
