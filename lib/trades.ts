// lib/trades.ts — Mock data for EWZ Brazil Elections trade ideas

export const SPOT_PRICE = 37.53

export const electionDates = [
  { label: 'Build-up period', date: 'Aug–Sep 2026', type: 'range' as const },
  { label: '1st Round', date: 'Oct 4, 2026', type: 'event' as const },
  { label: 'Exp #1 (Trade 1)', date: 'Oct 16, 2026', type: 'expiry' as const },
  { label: '2nd Round (if needed)', date: 'Oct 25, 2026', type: 'event' as const },
  { label: 'Exp #2 (Trade 2)', date: 'Nov 20, 2026', type: 'expiry' as const },
]

export interface Trade {
  id: string
  title: string
  subtitle: string
  ticker: string
  structure: string
  strike: number
  expiry: string
  expiryDate: string
  callPremium: number
  putPremium: number
  totalPremium: number
  costPerContract: number
  maxLoss: number
  breakEvenLow: number
  breakEvenHigh: number
  moveHurdle: number
  moveHurdlePct: string
  why: string
  mainRisk: string
  badge: 'Election-only' | 'Election + Runoff'
  color: 'green' | 'blue'
}

export const trades: Trade[] = [
  {
    id: 'ewz-oct-straddle',
    title: 'EWZ 37 Straddle',
    subtitle: 'Election-only shock window',
    ticker: 'EWZ',
    structure: 'Long Straddle (Buy Call + Buy Put)',
    strike: 37,
    expiry: 'Oct 16, 2026',
    expiryDate: '2026-10-16',
    callPremium: 3.95,
    putPremium: 3.30,
    totalPremium: 7.25,
    costPerContract: 725,
    maxLoss: 725,
    breakEvenLow: 29.75,
    breakEvenHigh: 44.25,
    moveHurdle: 7.25,
    moveHurdlePct: '19.3%',
    why: 'Cheaper, purer event play — captures only the 1st round shock',
    mainRisk: 'Vol crush right after Oct 4 if outcome is clean',
    badge: 'Election-only',
    color: 'green',
  },
  {
    id: 'ewz-nov-straddle',
    title: 'EWZ 37 Straddle',
    subtitle: 'Election + Runoff window',
    ticker: 'EWZ',
    structure: 'Long Straddle (Buy Call + Buy Put)',
    strike: 37,
    expiry: 'Nov 20, 2026',
    expiryDate: '2026-11-20',
    callPremium: 4.28,
    putPremium: 4.35,
    totalPremium: 8.63,
    costPerContract: 863,
    maxLoss: 863,
    breakEvenLow: 28.37,
    breakEvenHigh: 45.63,
    moveHurdle: 8.63,
    moveHurdlePct: '23.0%',
    why: 'More time: covers runoff (Oct 25) + post-election fiscal repricing',
    mainRisk: 'Expensive carry — slower theta bleed over longer horizon',
    badge: 'Election + Runoff',
    color: 'blue',
  },
]

export const thesisParagraph = `I'm long EWZ volatility around Brazil's Oct 4 election. The clean expression is a 37 straddle. I'm comparing two windows: Oct 16 to capture first-round shock, and Nov 20 to include a potential Oct 25 runoff and post-election repricing. The market is effectively charging ~19% (Oct) vs ~23% (Nov) move to break even at expiry, so my edge must come from either a larger realized move than implied, or monetizing an IV ramp before expiry.`

export const keyRisks = [
  {
    title: 'Theta Bleed',
    description: 'You pay time decay every day you hold. Every calendar day erodes premium even if EWZ stays flat.',
    icon: 'clock',
  },
  {
    title: 'Post-Event Vol Crush',
    description: 'If the Oct 4 outcome is clean, IV can drop sharply the next day — hurting both legs even if EWZ moves.',
    icon: 'trending-down',
  },
  {
    title: 'Move Hurdle Is Not Small',
    description: '±19% (Oct) and ±23% (Nov) are large required moves. You need a genuine political shock to profit at expiry.',
    icon: 'alert-triangle',
  },
]

export const monetizationPlan = [
  {
    plan: 'Plan A — IV Ramp (Most Common)',
    description: 'Sell into the implied volatility ramp pre-election or during election week, before expiry.',
  },
  {
    plan: 'Plan B — Realized Move',
    description: 'If chaos erupts and the realized move accelerates with rising runoff risk, hold through expiry.',
  },
]

// Generate payoff curve data for chart
export function generatePayoffData(trade: Trade) {
  const points = []
  const low = trade.strike * 0.55
  const high = trade.strike * 1.45
  const step = (high - low) / 80

  for (let spot = low; spot <= high; spot += step) {
    const callPayoff = Math.max(spot - trade.strike, 0)
    const putPayoff = Math.max(trade.strike - spot, 0)
    const pnl = (callPayoff + putPayoff - trade.totalPremium) * 100
    points.push({
      spot: parseFloat(spot.toFixed(2)),
      pnl: parseFloat(pnl.toFixed(0)),
    })
  }
  return points
}
