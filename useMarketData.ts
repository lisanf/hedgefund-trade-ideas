'use client'

// hooks/useMarketData.ts
// Polls /api/market every 60s. Falls back gracefully on error.

import { useState, useEffect, useCallback, useRef } from 'react'
import { MarketData } from '@/lib/market'
import { trades, SPOT_PRICE } from '@/lib/trades'

const POLL_INTERVAL_MS = 60_000 // 60 seconds

function buildMockFallback(): MarketData {
  return {
    spot: { price: SPOT_PRICE, change: 0, changePct: 0, previousClose: SPOT_PRICE },
    straddles: trades.map((t) => ({
      tradeId: t.id,
      call: {
        strike: t.strike, expiry: t.expiryDate,
        last: t.callPremium, bid: t.callPremium - 0.05, ask: t.callPremium + 0.05,
        mid: t.callPremium, iv: null, volume: null, openInterest: null,
      },
      put: {
        strike: t.strike, expiry: t.expiryDate,
        last: t.putPremium, bid: t.putPremium - 0.05, ask: t.putPremium + 0.05,
        mid: t.putPremium, iv: null, volume: null, openInterest: null,
      },
      totalLast: t.totalPremium,
      totalMid: t.totalPremium,
      totalBid: t.totalPremium - 0.1,
      totalAsk: t.totalPremium + 0.1,
    })),
    fetchedAt: new Date().toISOString(),
    source: 'mock',
  }
}

export interface UseMarketDataReturn {
  data: MarketData | null
  loading: boolean
  lastUpdated: Date | null
  refresh: () => void
}

export function useMarketData(): UseMarketDataReturn {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/market', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: MarketData = await res.json()
      setData(json)
      setLastUpdated(new Date())
    } catch (err) {
      console.warn('[useMarketData] fetch failed, using mock fallback:', err)
      setData(buildMockFallback())
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    timerRef.current = setInterval(fetchData, POLL_INTERVAL_MS)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fetchData])

  return { data, loading, lastUpdated, refresh: fetchData }
}
