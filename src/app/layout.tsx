import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sledge | Mini Invoice Approval Desk",
  description: "Production-grade contractor invoice approval desk for The Builders AI Office",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
