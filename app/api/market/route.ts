// app/api/market/route.ts
// Server-side route — calls Yahoo Finance, returns structured market data
// No API key required. ~15min delay on free tier.

import { NextResponse } from 'next/server'
import {
  MarketData,
  StradlleData,
  OptionLeg,
  SpotData,
  calcMid,
  EXPIRY_TIMESTAMPS,
} from '@/lib/market'
import { trades, SPOT_PRICE } from '@/lib/trades'

// Yahoo Finance headers to avoid bot-detection blocks
const YF_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  Origin: 'https://finance.yahoo.com',
  Referer: 'https://finance.yahoo.com/',
}


export const dynamic = 'force-dynamic'

async function fetchSpot(): Promise<SpotData | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/EWZ?interval=1m&range=1d`
    const res = await fetch(url, { headers: YF_HEADERS, cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()

    const meta = json?.chart?.result?.[0]?.meta
    if (!meta) throw new Error('No meta in response')

    const price: number = meta.regularMarketPrice ?? meta.chartPreviousClose
    const prevClose: number = meta.chartPreviousClose ?? meta.previousClose ?? price
    const change = parseFloat((price - prevClose).toFixed(2))
    const changePct = parseFloat(((change / prevClose) * 100).toFixed(2))

    return { price, change, changePct, previousClose: prevClose }
  } catch (err) {
    console.error('[fetchSpot] failed:', err)
    return null
  }
}

async function fetchOptionLegs(
  expiryKey: string,
  strike: number
): Promise<{ call: OptionLeg; put: OptionLeg } | null> {
  try {
    const timestamp = EXPIRY_TIMESTAMPS[expiryKey]
    if (!timestamp) throw new Error(`No timestamp for ${expiryKey}`)

    const url = `https://query2.finance.yahoo.com/v7/finance/options/EWZ?date=${timestamp}`
    const res = await fetch(url, { headers: YF_HEADERS, cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()

    const optionData = json?.optionChain?.result?.[0]?.options?.[0]
    if (!optionData) throw new Error('No options data in response')

    const calls: any[] = optionData.calls ?? []
    const puts: any[] = optionData.puts ?? []

    // Find closest strike (usually exact match, but handle float imprecision)
    const findClosest = (arr: any[]) =>
      arr.reduce((best: any, cur: any) => {
        if (!best) return cur
        return Math.abs(cur.strike - strike) < Math.abs(best.strike - strike) ? cur : best
      }, null)

    const rawCall = findClosest(calls)
    const rawPut = findClosest(puts)

    const parseOption = (raw: any, type: 'call' | 'put'): OptionLeg => {
      if (!raw) {
        return {
          strike,
          expiry: expiryKey,
          last: null,
          bid: null,
          ask: null,
          mid: null,
          iv: null,
          volume: null,
          openInterest: null,
        }
      }
      const bid = raw.bid ?? null
      const ask = raw.ask ?? null
      return {
        strike: raw.strike ?? strike,
        expiry: expiryKey,
        last: raw.lastPrice ?? null,
        bid,
        ask,
        mid: calcMid(bid, ask),
        iv: raw.impliedVolatility ?? null,
        volume: raw.volume ?? null,
        openInterest: raw.openInterest ?? null,
      }
    }

    return {
      call: parseOption(rawCall, 'call'),
      put: parseOption(rawPut, 'put'),
    }
  } catch (err) {
    console.error(`[fetchOptionLegs] ${expiryKey} failed:`, err)
    return null
  }
}

function buildMockStraddle(trade: (typeof trades)[0]): StradlleData {
  return {
    tradeId: trade.id,
    call: {
      strike: trade.strike,
      expiry: trade.expiryDate,
      last: trade.callPremium,
      bid: trade.callPremium - 0.05,
      ask: trade.callPremium + 0.05,
      mid: trade.callPremium,
      iv: null,
      volume: null,
      openInterest: null,
    },
    put: {
      strike: trade.strike,
      expiry: trade.expiryDate,
      last: trade.putPremium,
      bid: trade.putPremium - 0.05,
      ask: trade.putPremium + 0.05,
      mid: trade.putPremium,
      iv: null,
      volume: null,
      openInterest: null,
    },
    totalLast: trade.totalPremium,
    totalMid: trade.totalPremium,
    totalBid: trade.totalPremium - 0.1,
    totalAsk: trade.totalPremium + 0.1,
  }
}

export async function GET() {
  try {
    // Fetch spot and both options chains in parallel
    const [spot, octLegs, novLegs] = await Promise.all([
      fetchSpot(),
      fetchOptionLegs('2026-10-16', 37),
      fetchOptionLegs('2026-11-20', 37),
    ])

    const straddles: StradlleData[] = trades.map((trade) => {
      const legs =
        trade.expiryDate === '2026-10-16'
          ? octLegs
          : trade.expiryDate === '2026-11-20'
          ? novLegs
          : null

      if (!legs) return buildMockStraddle(trade)

      const { call, put } = legs

      const totalLast =
        call.last != null && put.last != null
          ? parseFloat((call.last + put.last).toFixed(2))
          : null
      const totalMid =
        call.mid != null && put.mid != null
          ? parseFloat((call.mid + put.mid).toFixed(2))
          : null
      const totalBid =
        call.bid != null && put.bid != null
          ? parseFloat((call.bid + put.bid).toFixed(2))
          : null
      const totalAsk =
        call.ask != null && put.ask != null
          ? parseFloat((call.ask + put.ask).toFixed(2))
          : null

      return { tradeId: trade.id, call, put, totalLast, totalMid, totalBid, totalAsk }
    })

    const isLive = spot != null || octLegs != null || novLegs != null

    const data: MarketData = {
      spot: spot ?? {
        price: SPOT_PRICE,
        change: 0,
        changePct: 0,
        previousClose: SPOT_PRICE,
      },
      straddles,
      fetchedAt: new Date().toISOString(),
      source: isLive ? 'live' : 'mock',
    }

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    })
  } catch (err: any) {
    console.error('[/api/market] top-level error:', err)

    // Full fallback to mock
    const fallback: MarketData = {
      spot: { price: SPOT_PRICE, change: 0, changePct: 0, previousClose: SPOT_PRICE },
      straddles: trades.map(buildMockStraddle),
      fetchedAt: new Date().toISOString(),
      source: 'error',
      error: err?.message ?? 'Unknown error',
    }
    return NextResponse.json(fallback, { status: 200 }) // still 200 — UI handles gracefully
  }
}
