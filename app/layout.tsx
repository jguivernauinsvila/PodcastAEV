export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ca">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0b0b1a" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>

      <body>{children}</body>
    </html>
  )
}