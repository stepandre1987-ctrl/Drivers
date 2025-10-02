import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Drivers",
  description: "Firemní aplikace pro směny a kilometry",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="cs">
      <body>
        {children}
      </body>
    </html>
  );
}
