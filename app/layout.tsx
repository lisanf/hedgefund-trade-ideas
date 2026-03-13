import type { Metadata } from 'next'
import './globals.css'
import { MarketDataProvider } from '@/components/MarketDataProvider'

export const metadata: Metadata = {
  title: 'Trade Ideas — EWZ Long Volatility · Brazil 2026',
  description: 'Structured long-vol trade ideas around Brazil federal elections 2026. EWZ straddle, two expiry windows.',
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
