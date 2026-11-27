import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Palmrise | Event Management & QR Pass System",
  description: "Palmrise Event Management System — Unified QR ticketing, guest RSVP, table management, and real-time gate check-in.",
  icons: {
    icon: [
      { url: "/palmrise-logo.png", type: "image/png" }
    ],
    shortcut: "/palmrise-logo.png",
    apple: [
      { url: "/palmrise-logo.png", type: "image/png" }
    ]
  },
  openGraph: {
    title: "Palmrise | Event Management & QR Pass System",
    description: "Palmrise Event Management System — Unified QR ticketing, guest RSVP, table management, and real-time gate check-in.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-[#0f172a] font-sans">
        {children}
      </body>
    </html>
  );
}
