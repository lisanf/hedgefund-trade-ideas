import type { Metadata } from 'next'
import './globals.css'
import { MarketProvider } from '@/components/MarketProvider'

export const metadata: Metadata = {
  title: 'Signals — Trade Ideas',
  description: 'Structured trade ideas around catalysts and volatility.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <MarketProvider>{children}</MarketProvider>
      </body>
    </html>
  )
}
