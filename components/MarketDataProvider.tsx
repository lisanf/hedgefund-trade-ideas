'use client'

// components/MarketDataProvider.tsx
// Context that makes market data available to all child components

import { createContext, useContext, ReactNode } from 'react'
import { useMarketData, UseMarketDataReturn } from '@/hooks/useMarketData'

const MarketDataContext = createContext<UseMarketDataReturn | null>(null)

export function MarketDataProvider({ children }: { children: ReactNode }) {
  const marketData = useMarketData()
  return (
    <MarketDataContext.Provider value={marketData}>
      {children}
    </MarketDataContext.Provider>
  )
}

export function useMarket(): UseMarketDataReturn {
  const ctx = useContext(MarketDataContext)
  if (!ctx) throw new Error('useMarket must be used inside <MarketDataProvider>')
  return ctx
}
