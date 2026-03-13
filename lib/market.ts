export interface OptionLeg {
  strike:        number
  expiry:        string
  last:          number | null
  bid:           number | null
  ask:           number | null
  mid:           number | null
  iv:            number | null
  volume:        number | null
  openInterest:  number | null
}

export interface StraddleData {
  tradeId:    string
  call:       OptionLeg
  put:        OptionLeg
  totalLast:  number | null
  totalMid:   number | null
  totalBid:   number | null
  totalAsk:   number | null
}

export interface SpotData {
  price:         number
  change:        number
  changePct:     number
  previousClose: number
}

export interface MarketData {
  spot:      SpotData | null
  straddles: StraddleData[]
  fetchedAt: string
  source:    'live' | 'mock' | 'error'
  error?:    string
}

export const EXPIRY_TIMESTAMPS: Record<string, number> = {
  '2026-10-16': 1760572800,
  '2026-11-20': 1763769600,
}

export function calcMid(bid: number | null, ask: number | null): number | null {
  if (bid == null || ask == null) return null
  return parseFloat(((bid + ask) / 2).toFixed(2))
}

export function fmt(val: number | null, decimals = 2): string {
  if (val == null) return '—'
  return `$${val.toFixed(decimals)}`
}

export function fmtIV(val: number | null): string {
  if (val == null) return '—'
  return `${(val * 100).toFixed(1)}%`
}

export function changeColor(change: number): string {
  if (change > 0) return 'text-profit'
  if (change < 0) return 'text-loss'
  return 'text-tertiary'
}
