import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MicroPodcasts",
  description: "A mobile-first feed of short audio podcast entries."
};

export const viewport: Viewport = {
  themeColor: "#fffaf2",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0b0b1a" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>

      <body>{children}</body>
    </html>
  )
}
