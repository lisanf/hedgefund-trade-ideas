import { NextResponse } from 'next/server'
import { MarketData, StraddleData, OptionLeg, calcMid, EXPIRY_TIMESTAMPS } from '@/lib/market'
import { trades, SPOT_PRICE } from '@/lib/trades'

export const revalidate = 300

const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json',
  Origin: 'https://finance.yahoo.com',
  Referer: 'https://finance.yahoo.com/',
}

async function fetchSpot() {
  try {
    const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/EWZ?interval=1m&range=1d', {
      headers: YF_HEADERS, next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const meta = json?.chart?.result?.[0]?.meta
    if (!meta) throw new Error('no meta')
    const price: number = meta.regularMarketPrice ?? meta.chartPreviousClose
    const prev: number  = meta.chartPreviousClose ?? price
    return { price, change: parseFloat((price - prev).toFixed(2)), changePct: parseFloat(((price - prev) / prev * 100).toFixed(2)), previousClose: prev }
  } catch { return null }
}

async function fetchLegs(expiryKey: string, strike: number) {
  try {
    const ts = EXPIRY_TIMESTAMPS[expiryKey]
    if (!ts) throw new Error('no ts')
    const res = await fetch(`https://query2.finance.yahoo.com/v7/finance/options/EWZ?date=${ts}`, {
      headers: YF_HEADERS, next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const opts = json?.optionChain?.result?.[0]?.options?.[0]
    if (!opts) throw new Error('no options')

    const closest = (arr: any[]) => arr.reduce((b: any, c: any) =>
      !b ? c : Math.abs(c.strike - strike) < Math.abs(b.strike - strike) ? c : b, null)

    const parse = (raw: any): OptionLeg => {
      if (!raw) return { strike, expiry: expiryKey, last: null, bid: null, ask: null, mid: null, iv: null, volume: null, openInterest: null }
      const bid = raw.bid ?? null, ask = raw.ask ?? null
      return { strike: raw.strike ?? strike, expiry: expiryKey, last: raw.lastPrice ?? null, bid, ask, mid: calcMid(bid, ask), iv: raw.impliedVolatility ?? null, volume: raw.volume ?? null, openInterest: raw.openInterest ?? null }
    }

    return { call: parse(closest(opts.calls ?? [])), put: parse(closest(opts.puts ?? [])) }
  } catch { return null }
}

function mockStraddle(trade: typeof trades[0]): StraddleData {
  return {
    tradeId: trade.id,
    call: { strike: trade.strike, expiry: trade.expiryDate, last: trade.callPremium, bid: trade.callPremium - 0.05, ask: trade.callPremium + 0.05, mid: trade.callPremium, iv: null, volume: null, openInterest: null },
    put:  { strike: trade.strike, expiry: trade.expiryDate, last: trade.putPremium,  bid: trade.putPremium  - 0.05, ask: trade.putPremium  + 0.05, mid: trade.putPremium,  iv: null, volume: null, openInterest: null },
    totalLast: trade.totalPremium, totalMid: trade.totalPremium,
    totalBid: trade.totalPremium - 0.1, totalAsk: trade.totalPremium + 0.1,
  }
}

export async function GET() {
  try {
    const [spot, octLegs, novLegs] = await Promise.all([
      fetchSpot(),
      fetchLegs('2026-10-16', 37),
      fetchLegs('2026-11-20', 37),
    ])

    const straddles: StraddleData[] = trades.map(t => {
      const legs = t.expiryDate === '2026-10-16' ? octLegs : t.expiryDate === '2026-11-20' ? novLegs : null
      if (!legs) return mockStraddle(t)
      const { call, put } = legs
      return {
        tradeId: t.id, call, put,
        totalLast: call.last != null && put.last != null ? parseFloat((call.last + put.last).toFixed(2)) : null,
        totalMid:  call.mid  != null && put.mid  != null ? parseFloat((call.mid  + put.mid ).toFixed(2)) : null,
        totalBid:  call.bid  != null && put.bid  != null ? parseFloat((call.bid  + put.bid ).toFixed(2)) : null,
        totalAsk:  call.ask  != null && put.ask  != null ? parseFloat((call.ask  + put.ask ).toFixed(2)) : null,
      }
    })

    const data: MarketData = {
      spot: spot ?? { price: SPOT_PRICE, change: 0, changePct: 0, previousClose: SPOT_PRICE },
      straddles,
      fetchedAt: new Date().toISOString(),
      source: spot != null || octLegs != null || novLegs != null ? 'live' : 'mock',
    }
    return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } })
  } catch (err: any) {
    return NextResponse.json({
      spot: { price: SPOT_PRICE, change: 0, changePct: 0, previousClose: SPOT_PRICE },
      straddles: trades.map(mockStraddle),
      fetchedAt: new Date().toISOString(),
      source: 'error', error: err?.message,
    } as MarketData)
  }
}
