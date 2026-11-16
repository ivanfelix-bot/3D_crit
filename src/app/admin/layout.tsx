import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "../globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Admin | 3D Crit",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f8f5ef" };

/** Layout radice dell'area admin (solo in italiano, mai indicizzata). */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="it" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
