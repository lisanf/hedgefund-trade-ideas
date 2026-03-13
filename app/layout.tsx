import type { Metadata } from 'next'
import './globals.css'
import { MarketDataProvider } from '@/components/MarketDataProvider'

export const metadata: Metadata = {
  title: 'Signals — Investment Ideas',
  description: 'Curated trade ideas and market analysis.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <MarketDataProvider>
          {children}
        </MarketDataProvider>
      </body>
    </html>
  )
}
