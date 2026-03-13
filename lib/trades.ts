export const SPOT_PRICE = 37.53

export const electionDates = [
  { label: 'Build-up period',       date: 'Aug–Sep 2026',  type: 'range'  as const },
  { label: '1st Round',             date: 'Oct 4, 2026',   type: 'event'  as const },
  { label: 'Trade 1 Expiry',        date: 'Oct 16, 2026',  type: 'expiry' as const },
  { label: '2nd Round (if needed)', date: 'Oct 25, 2026',  type: 'event'  as const },
  { label: 'Trade 2 Expiry',        date: 'Nov 20, 2026',  type: 'expiry' as const },
]

export interface Trade {
  id:            string
  title:         string
  subtitle:      string
  ticker:        string
  strike:        number
  expiry:        string
  expiryDate:    string
  callPremium:   number
  putPremium:    number
  totalPremium:  number
  costPerContract: number
  breakEvenLow:  number
  breakEvenHigh: number
  moveHurdlePct: string
  why:           string
  mainRisk:      string
  badge:         string
  color:         'green' | 'blue'
}

export const trades: Trade[] = [
  {
    id:            'ewz-oct-straddle',
    title:         'EWZ 37 Straddle',
    subtitle:      'Election-only shock window',
    ticker:        'EWZ',
    strike:        37,
    expiry:        'Oct 16, 2026',
    expiryDate:    '2026-10-16',
    callPremium:   3.95,
    putPremium:    3.30,
    totalPremium:  7.25,
    costPerContract: 725,
    breakEvenLow:  29.75,
    breakEvenHigh: 44.25,
    moveHurdlePct: '19.3%',
    why:           'Cheaper, purer event play — captures only the 1st round shock.',
    mainRisk:      'Vol crush right after Oct 4 if outcome is clean.',
    badge:         'Election-only',
    color:         'green',
  },
  {
    id:            'ewz-nov-straddle',
    title:         'EWZ 37 Straddle',
    subtitle:      'Election + Runoff window',
    ticker:        'EWZ',
    strike:        37,
    expiry:        'Nov 20, 2026',
    expiryDate:    '2026-11-20',
    callPremium:   4.28,
    putPremium:    4.35,
    totalPremium:  8.63,
    costPerContract: 863,
    breakEvenLow:  28.37,
    breakEvenHigh: 45.63,
    moveHurdlePct: '23.0%',
    why:           'More time: covers the Oct 25 runoff + post-election fiscal repricing.',
    mainRisk:      'Expensive carry — slower theta bleed over longer horizon.',
    badge:         'Election + Runoff',
    color:         'blue',
  },
]

export function generatePayoffData(trade: Trade, overridePremium?: number) {
  const premium = overridePremium ?? trade.totalPremium
  const low  = trade.strike * 0.55
  const high = trade.strike * 1.45
  const step = (high - low) / 80
  const points = []
  for (let s = low; s <= high; s += step) {
    const pnl = (Math.max(s - trade.strike, 0) + Math.max(trade.strike - s, 0) - premium) * 100
    points.push({ spot: parseFloat(s.toFixed(2)), pnl: parseFloat(pnl.toFixed(0)) })
  }
  return points
}
