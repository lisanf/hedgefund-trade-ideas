'use client'
import { createContext, useContext, ReactNode } from 'react'
import { useMarketData, MarketHook } from '@/hooks/useMarketData'

const Ctx = createContext<MarketHook | null>(null)

export function MarketProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={useMarketData()}>{children}</Ctx.Provider>
}

export function useMarket(): MarketHook {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useMarket must be inside <MarketProvider>')
  return ctx
}
