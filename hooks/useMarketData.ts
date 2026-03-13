'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { MarketData } from '@/lib/market'
import { trades, SPOT_PRICE } from '@/lib/trades'

function mockFallback(): MarketData {
  return {
    spot: { price: SPOT_PRICE, change: 0, changePct: 0, previousClose: SPOT_PRICE },
    straddles: trades.map(t => ({
      tradeId: t.id,
      call: { strike: t.strike, expiry: t.expiryDate, last: t.callPremium, bid: t.callPremium - 0.05, ask: t.callPremium + 0.05, mid: t.callPremium, iv: null, volume: null, openInterest: null },
      put:  { strike: t.strike, expiry: t.expiryDate, last: t.putPremium,  bid: t.putPremium  - 0.05, ask: t.putPremium  + 0.05, mid: t.putPremium,  iv: null, volume: null, openInterest: null },
      totalLast: t.totalPremium, totalMid: t.totalPremium,
      totalBid: t.totalPremium - 0.1, totalAsk: t.totalPremium + 0.1,
    })),
    fetchedAt: new Date().toISOString(),
    source: 'mock',
  }
}

export interface MarketHook {
  data: MarketData | null
  loading: boolean
  lastUpdated: Date | null
  refresh: () => void
}

export function useMarketData(): MarketHook {
  const [data, setData]               = useState<MarketData | null>(null)
  const [loading, setLoading]         = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const timer                         = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/market', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
    } catch {
      setData(mockFallback())
    } finally {
      setLoading(false)
      setLastUpdated(new Date())
    }
  }, [])

  useEffect(() => {
    fetch_()
    timer.current = setInterval(fetch_, 60_000)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [fetch_])

  return { data, loading, lastUpdated, refresh: fetch_ }
}
