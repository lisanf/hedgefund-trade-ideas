import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trade Ideas — Long Volatility',
  description: 'Structured trade ideas around Brazil federal elections 2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
