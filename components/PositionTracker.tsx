'use client'

import { useState, useMemo } from 'react'
import { useMarket } from './MarketDataProvider'
import { trades, SPOT_PRICE } from '@/lib/trades'
import { fmt, fmtIV } from '@/lib/market'

// ─── helpers ───────────────────────────────────────────────────────────────

function daysToExpiry(expiryDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.max(0, Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
}

function dteColor(dte: number): string {
  if (dte <= 7)  return 'text-loss'
  if (dte <= 21) return 'text-amber-500'
  return 'text-ink'
}

function dteBg(dte: number): string {
  if (dte <= 7)  return 'bg-loss/10 border-loss/20'
  if (dte <= 21) return 'bg-amber-50 border-amber-200'
  return 'bg-canvas border-rule'
}

function pnlColor(val: number): string {
  if (val > 0)  return 'text-profit'
  if (val < 0)  return 'text-loss'
  return 'text-secondary'
}

function pnlBg(val: number): string {
  if (val > 0)  return 'bg-profit/8'
  if (val < 0)  return 'bg-loss/8'
  return 'bg-canvas'
}

// ─── per-trade panel ───────────────────────────────────────────────────────

interface TradePanelProps {
  tradeIndex: number
  invested: number               // $ invested (notional)
  entryIVCall?: number | null
  entryIVPut?: number | null
}

function TradePanel({ tradeIndex, invested }: TradePanelProps) {
  const trade = trades[tradeIndex]
  const isGreen = trade.color === 'green'
  const accentClass = isGreen ? 'text-br-green' : 'text-br-blue'
  const accentBg = isGreen ? 'bg-br-green/5 border-br-green/15' : 'bg-br-blue/5 border-br-blue/15'
  const accentBorder = isGreen ? 'border-br-green/20' : 'border-br-blue/20'

  const { data } = useMarket()
  const straddle = data?.straddles.find(s => s.tradeId === trade.id)
  const spot = data?.spot?.price ?? SPOT_PRICE

  const metrics = useMemo(() => {
    if (invested <= 0) return null

    // Current premium: prefer mid, else last, else mock
    const currentPremium = straddle?.totalMid ?? straddle?.totalLast ?? trade.totalPremium
    // Entry premium: use mock (the "last" at trade inception)
    const entryPremium = trade.totalPremium

    // Contracts = notional / cost per contract (entry * 100)
    const contracts = invested / (entryPremium * 100)
    const costBasis = contracts * entryPremium * 100   // same as invested
    const currentValue = contracts * currentPremium * 100
    const unrealizedPnl = currentValue - costBasis
    const pnlPct = (unrealizedPnl / costBasis) * 100

    // Breakevens (from current premium)
    const beLow = trade.strike - currentPremium
    const beHigh = trade.strike + currentPremium

    // Distance from spot to each breakeven
    const distToLow = ((spot - beLow) / spot) * 100      // positive = how far above lower BE
    const distToHigh = ((beHigh - spot) / spot) * 100    // positive = how far below upper BE

    // DTE
    const dte = daysToExpiry(trade.expiryDate)

    // IV (current from live data)
    const ivCall = straddle?.call.iv ?? null
    const ivPut  = straddle?.put.iv ?? null

    return {
      contracts: parseFloat(contracts.toFixed(4)),
      costBasis,
      currentValue,
      currentPremium,
      entryPremium,
      unrealizedPnl,
      pnlPct,
      beLow,
      beHigh,
      distToLow,
      distToHigh,
      dte,
      ivCall,
      ivPut,
    }
  }, [invested, straddle, spot, trade])

  if (invested <= 0) {
    return (
      <div className={`card border ${accentBorder} p-5 opacity-40`}>
        <p className="label mb-2">{trade.badge}</p>
        <p className="heading-lg text-xl text-ink mb-1">{trade.title}</p>
        <p className="text-sm text-tertiary font-sans mt-4 italic">Enter a notional amount above to track this position.</p>
      </div>
    )
  }

  if (!metrics) return null

  const {
    contracts, costBasis, currentValue, currentPremium, entryPremium,
    unrealizedPnl, pnlPct, beLow, beHigh, distToLow, distToHigh,
    dte, ivCall, ivPut,
  } = metrics

  const premiumDelta = currentPremium - entryPremium
  const premiumDeltaPct = (premiumDelta / entryPremium) * 100

  return (
    <div className={`card border ${accentBorder} overflow-hidden`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b border-rule flex items-center justify-between ${accentBg}`}>
        <div>
          <span className={`font-mono text-[10px] font-medium px-2 py-0.5 rounded mr-2 ${
            isGreen ? 'bg-br-green text-white' : 'bg-br-blue text-white'
          }`}>
            {trade.badge}
          </span>
          <span className="label">{trade.expiry}</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-medium ${dteBg(dte)} ${dteColor(dte)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dte <= 7 ? 'bg-loss' : dte <= 21 ? 'bg-amber-400' : 'bg-br-green'} flex-shrink-0`} />
          {dte}d to expiry
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* ── Hero P&L ── */}
        <div className={`rounded-xl px-4 py-4 ${pnlBg(unrealizedPnl)}`}>
          <p className="label mb-2">Unrealized P&L</p>
          <div className="flex items-baseline justify-between">
            <div>
              <span className={`font-mono text-3xl font-medium ${pnlColor(unrealizedPnl)}`}>
                {unrealizedPnl >= 0 ? '+' : ''}${Math.abs(unrealizedPnl).toFixed(0)}
              </span>
              <span className={`font-mono text-base ml-2 ${pnlColor(unrealizedPnl)}`}>
                ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%)
              </span>
            </div>
            <div className="text-right">
              <p className="label mb-0.5">Position size</p>
              <p className="font-mono text-sm text-ink">{contracts.toFixed(2)} contracts</p>
              <p className="font-mono text-xs text-tertiary">${costBasis.toFixed(0)} invested</p>
            </div>
          </div>
        </div>

        {/* ── Premium move ── */}
        <div>
          <p className="label mb-3">Premium (straddle total)</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-canvas rounded-lg px-3 py-2.5">
              <p className="label mb-1">Entry</p>
              <p className="font-mono text-sm font-medium text-secondary">${entryPremium.toFixed(2)}</p>
              <p className="font-mono text-[10px] text-tertiary mt-0.5">per share</p>
            </div>
            <div className="bg-canvas rounded-lg px-3 py-2.5">
              <p className="label mb-1">Current</p>
              <p className={`font-mono text-sm font-medium ${accentClass}`}>${currentPremium.toFixed(2)}</p>
              <p className="font-mono text-[10px] text-tertiary mt-0.5">mid price</p>
            </div>
            <div className={`rounded-lg px-3 py-2.5 ${premiumDelta >= 0 ? 'bg-profit/8' : 'bg-loss/8'}`}>
              <p className="label mb-1">Change</p>
              <p className={`font-mono text-sm font-medium ${pnlColor(premiumDelta)}`}>
                {premiumDelta >= 0 ? '+' : ''}{premiumDelta.toFixed(2)}
              </p>
              <p className={`font-mono text-[10px] mt-0.5 ${pnlColor(premiumDelta)}`}>
                ({premiumDeltaPct >= 0 ? '+' : ''}{premiumDeltaPct.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>

        {/* ── Breakeven distance ── */}
        <div>
          <p className="label mb-3">Breakeven distance from spot (${spot.toFixed(2)})</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Lower BE */}
            <div className={`rounded-xl px-4 py-3 border ${
              distToLow < 5 ? 'border-loss/30 bg-loss/5' : 'border-rule bg-canvas'
            }`}>
              <p className="label mb-1">Lower BE</p>
              <p className={`font-mono text-base font-medium ${accentClass}`}>${beLow.toFixed(2)}</p>
              <div className="mt-1.5">
                <p className={`font-mono text-xs font-medium ${distToLow < 5 ? 'text-loss' : distToLow < 10 ? 'text-amber-500' : 'text-secondary'}`}>
                  {distToLow.toFixed(1)}% above it
                </p>
                <p className="font-mono text-[10px] text-tertiary">spot must fall {distToLow.toFixed(1)}% to hit</p>
              </div>
            </div>

            {/* Upper BE */}
            <div className={`rounded-xl px-4 py-3 border ${
              distToHigh < 5 ? 'border-loss/30 bg-loss/5' : 'border-rule bg-canvas'
            }`}>
              <p className="label mb-1">Upper BE</p>
              <p className={`font-mono text-base font-medium ${accentClass}`}>${beHigh.toFixed(2)}</p>
              <div className="mt-1.5">
                <p className={`font-mono text-xs font-medium ${distToHigh < 5 ? 'text-loss' : distToHigh < 10 ? 'text-amber-500' : 'text-secondary'}`}>
                  {distToHigh.toFixed(1)}% below it
                </p>
                <p className="font-mono text-[10px] text-tertiary">spot must rise {distToHigh.toFixed(1)}% to hit</p>
              </div>
            </div>
          </div>

          {/* Visual progress bar showing spot position relative to breakevens */}
          <div className="mt-3">
            <BreakevenBar spot={spot} beLow={beLow} beHigh={beHigh} strike={trade.strike} accentClass={accentClass} />
          </div>
        </div>

        {/* ── IV ── */}
        {(ivCall != null || ivPut != null) && (
          <div>
            <p className="label mb-3">Implied volatility (current)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-canvas rounded-lg px-3 py-2.5">
                <p className="label mb-1">Call IV</p>
                <p className={`font-mono text-sm font-medium ${accentClass}`}>{fmtIV(ivCall)}</p>
              </div>
              <div className="bg-canvas rounded-lg px-3 py-2.5">
                <p className="label mb-1">Put IV</p>
                <p className={`font-mono text-sm font-medium ${accentClass}`}>{fmtIV(ivPut)}</p>
              </div>
            </div>
            <p className="font-mono text-[10px] text-tertiary mt-2">Entry IV not stored — live IV shown for reference only.</p>
          </div>
        )}

        {/* ── Position summary row ── */}
        <div className="pt-3 border-t border-rule flex flex-wrap gap-4 justify-between">
          <div>
            <p className="label mb-1">Cost basis</p>
            <p className="font-mono text-sm font-medium text-ink">${costBasis.toFixed(2)}</p>
          </div>
          <div>
            <p className="label mb-1">Current value</p>
            <p className={`font-mono text-sm font-medium ${pnlColor(currentValue - costBasis)}`}>${currentValue.toFixed(2)}</p>
          </div>
          <div>
            <p className="label mb-1">Max loss</p>
            <p className="font-mono text-sm font-medium text-loss">-${costBasis.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── breakeven visual bar ──────────────────────────────────────────────────

function BreakevenBar({
  spot, beLow, beHigh, strike, accentClass
}: {
  spot: number; beLow: number; beHigh: number; strike: number; accentClass: string
}) {
  // Range to display: a bit wider than the breakevens
  const displayMin = beLow * 0.88
  const displayMax = beHigh * 1.12

  function pct(val: number) {
    return Math.max(0, Math.min(100, ((val - displayMin) / (displayMax - displayMin)) * 100))
  }

  const beLowPct  = pct(beLow)
  const beHighPct = pct(beHigh)
  const spotPct   = pct(spot)
  const strikePct = pct(strike)

  const inProfit = spot < beLow || spot > beHigh

  return (
    <div className="relative h-8">
      {/* Track */}
      <div className="absolute top-3 left-0 right-0 h-2 bg-rule rounded-full overflow-hidden">
        {/* Profit zones (outside BEs) */}
        <div
          className="absolute top-0 bottom-0 bg-profit/20 rounded-l-full"
          style={{ left: 0, width: `${beLowPct}%` }}
        />
        <div
          className="absolute top-0 bottom-0 bg-profit/20 rounded-r-full"
          style={{ left: `${beHighPct}%`, right: 0 }}
        />
        {/* Loss zone (between BEs) */}
        <div
          className="absolute top-0 bottom-0 bg-loss/15"
          style={{ left: `${beLowPct}%`, width: `${beHighPct - beLowPct}%` }}
        />
      </div>

      {/* Strike pin */}
      <div
        className="absolute top-2 w-px h-4 bg-secondary/40"
        style={{ left: `${strikePct}%` }}
      />

      {/* BE ticks */}
      {[beLowPct, beHighPct].map((p, i) => (
        <div
          key={i}
          className={`absolute top-2 w-0.5 h-4 ${inProfit && (spot < beLow && i === 0 || spot > beHigh && i === 1) ? 'bg-profit' : 'bg-secondary/60'}`}
          style={{ left: `${p}%` }}
        />
      ))}

      {/* Spot marker — triangle */}
      <div
        className={`absolute top-1 w-2 h-2 rotate-45 border ${inProfit ? 'bg-profit border-profit' : 'bg-loss border-loss'}`}
        style={{ left: `calc(${spotPct}% - 4px)` }}
      />

      {/* Labels */}
      <div className="absolute top-7 w-full flex justify-between">
        <span className="font-mono text-[9px] text-tertiary">${displayMin.toFixed(0)}</span>
        <span className="font-mono text-[9px] text-tertiary">${displayMax.toFixed(0)}</span>
      </div>
    </div>
  )
}

// ─── Main PositionTracker ──────────────────────────────────────────────────

export default function PositionTracker() {
  const [octInvested, setOctInvested] = useState<string>('')
  const [novInvested, setNovInvested] = useState<string>('')
  const { data } = useMarket()
  const isLive = data?.source === 'live'

  const octVal = parseFloat(octInvested) || 0
  const novVal = parseFloat(novInvested) || 0
  const totalInvested = octVal + novVal

  return (
    <section id="tracker" className="px-6 py-20 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <p className="label mb-2">Position tracker</p>
          <h2 className="heading-lg text-3xl text-ink">Track Your P&L</h2>
          <p className="text-secondary text-sm font-sans leading-relaxed mt-2 max-w-lg">
            Enter your notional investment per window. P&L, breakeven distances,
            and DTE update live as market data refreshes.
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-mono text-xs ${
          isLive
            ? 'bg-profit/8 border-profit/20 text-profit'
            : 'bg-canvas border-rule text-tertiary'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-profit animate-pulse' : 'bg-rule'}`} />
          {isLive ? 'Live mid prices' : 'Mock / fallback'}
        </div>
      </div>

      {/* Notional input row */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {[
          {
            trade: trades[0],
            val: octInvested,
            set: setOctInvested,
            placeholder: 'e.g. 725',
            color: 'br-green',
            hint: `1 contract = $${trades[0].costPerContract}`,
          },
          {
            trade: trades[1],
            val: novInvested,
            set: setNovInvested,
            placeholder: 'e.g. 863',
            color: 'br-blue',
            hint: `1 contract = $${trades[1].costPerContract}`,
          },
        ].map(({ trade, val, set, placeholder, color, hint }) => (
          <div
            key={trade.id}
            className={`card border border-${color}/20 p-5`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="label mb-1">{trade.badge}</p>
                <p className={`heading-md text-sm text-ink`}>{trade.title} · {trade.expiry}</p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-tertiary pointer-events-none">$</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={val}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className={`w-full pl-7 pr-4 py-2.5 rounded-lg border bg-canvas font-mono text-sm text-ink
                  placeholder:text-tertiary focus:outline-none focus:ring-1
                  border-rule focus:border-${color} focus:ring-${color}/20
                  transition-colors`}
              />
            </div>

            <div className="flex items-center justify-between mt-2">
              <p className="font-mono text-[10px] text-tertiary">{hint}</p>
              {parseFloat(val) > 0 && (
                <p className="font-mono text-[10px] text-secondary">
                  ≈ {(parseFloat(val) / (trade.totalPremium * 100)).toFixed(2)} contracts
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total invested summary bar */}
      {totalInvested > 0 && (
        <div className="card border border-rule px-5 py-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="label mb-1">Total notional invested</p>
              <p className="font-mono text-xl font-medium text-ink">${totalInvested.toFixed(2)}</p>
            </div>
            {octVal > 0 && novVal > 0 && (
              <>
                <div className="w-px h-8 bg-rule" />
                <div>
                  <p className="label mb-1">Oct 16 allocation</p>
                  <p className="font-mono text-sm font-medium text-br-green">
                    ${octVal.toFixed(0)} ({((octVal / totalInvested) * 100).toFixed(0)}%)
                  </p>
                </div>
                <div>
                  <p className="label mb-1">Nov 20 allocation</p>
                  <p className="font-mono text-sm font-medium text-br-blue">
                    ${novVal.toFixed(0)} ({((novVal / totalInvested) * 100).toFixed(0)}%)
                  </p>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => { setOctInvested(''); setNovInvested('') }}
            className="font-mono text-xs text-tertiary hover:text-loss transition-colors border border-rule rounded px-3 py-1.5"
          >
            Clear
          </button>
        </div>
      )}

      {/* Per-trade panels */}
      <div className="grid md:grid-cols-2 gap-5">
        <TradePanel tradeIndex={0} invested={octVal} />
        <TradePanel tradeIndex={1} invested={novVal} />
      </div>

      {/* Footnote */}
      <p className="font-mono text-[10px] text-tertiary mt-6 text-center leading-relaxed max-w-2xl mx-auto">
        P&L calculated using current mid price vs entry "last" premium from mock data.
        Entry IV comparison requires storing your actual fill IV — coming in a future update.
        Not financial advice.
      </p>
    </section>
  )
}
