// lib/market.ts — Live market data types and helpers

export interface OptionLeg {
  strike: number
  expiry: string
  last: number | null
  bid: number | null
  ask: number | null
  mid: number | null
  iv: number | null       // implied volatility as decimal (e.g. 0.35 = 35%)
  volume: number | null
  openInterest: number | null
}

export interface StradlleData {
  tradeId: string
  call: OptionLeg
  put: OptionLeg
  totalLast: number | null     // call.last + put.last
  totalMid: number | null      // call.mid + put.mid (best estimate of true cost)
  totalBid: number | null
  totalAsk: number | null
}

export interface SpotData {
  price: number
  change: number        // absolute change
  changePct: number     // percentage change
  previousClose: number
}

export interface MarketData {
  spot: SpotData | null
  straddles: StradlleData[]
  fetchedAt: string     // ISO timestamp
  source: 'live' | 'mock' | 'error'
  error?: string
}

// Unix timestamps for each expiry (used as Yahoo Finance date param)
// Options expire on 3rd Friday of each month
// Oct 16, 2026 = Oct 3rd Friday
// Nov 20, 2026 = Nov 3rd Friday
export const EXPIRY_TIMESTAMPS: Record<string, number> = {
  '2026-10-16': 1760572800,
  '2026-11-20': 1763769600,
}

// Calculate mid price
export function calcMid(bid: number | null, ask: number | null): number | null {
  if (bid == null || ask == null) return null
  return parseFloat(((bid + ask) / 2).toFixed(2))
}

// Format a number as dollar price
export function fmt(val: number | null, decimals = 2): string {
  if (val == null) return '—'
  return `$${val.toFixed(decimals)}`
}

// Format IV as percentage
export function fmtIV(val: number | null): string {
  if (val == null) return '—'
  return `${(val * 100).toFixed(1)}%`
}

// Change color helper
export function changeColor(change: number): string {
  if (change > 0) return 'text-profit'
  if (change < 0) return 'text-loss'
  return 'text-muted'
}
