'use client'

import { Trade, SPOT_PRICE } from '@/lib/trades'
import { fmt } from '@/lib/market'
import { useMarket } from './MarketDataProvider'
import OptionLegRow from './OptionLegRow'

interface Props {
  trade: Trade
  index: number
}

export default function TradeCard({ trade, index }: Props) {
  const isGreen = trade.color === 'green'
  const accentClass = isGreen ? 'text-brazil-green' : 'text-brazil-blue'
  const borderClass = isGreen ? 'border-brazil-green/20' : 'border-brazil-blue/20'
  const headerBg = isGreen ? 'bg-brazil-green/5 border-brazil-green/15' : 'bg-brazil-blue/5 border-brazil-blue/15'
  const badgeBg = isGreen ? 'bg-brazil-green text-white' : 'bg-brazil-blue text-white'

  const { data, loading } = useMarket()
  const liveStraddle = data?.straddles.find((s) => s.tradeId === trade.id)

  // Prefer live totalMid, fall back to totalLast, then mock
  const displayTotal = liveStraddle?.totalMid
    ?? liveStraddle?.totalLast
    ?? trade.totalPremium

  // Recalculate breakevens with live total
  const liveBreakevenLow = trade.strike - displayTotal
  const liveBreakevenHigh = trade.strike + displayTotal
  const currentSpot = data?.spot?.price ?? SPOT_PRICE
  const liveMoveHurdle = ((displayTotal / currentSpot) * 100).toFixed(1)

  const isLive = data?.source === 'live'

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden transition-shadow hover:shadow-lg ${borderClass}`}
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      {/* Header */}
      <div className={`px-6 py-5 border-b ${headerBg}`}>
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-full ${badgeBg}`}>
            {trade.badge}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted">{trade.ticker}</span>
            {isLive && (
              <span className="flex items-center gap-1 text-xs font-mono text-profit">
                <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse inline-block" />
                Live
              </span>
            )}
          </div>
        </div>
        <h2 className="font-display text-2xl font-bold text-ink tracking-tight">{trade.title}</h2>
        <p className="text-sm font-body text-muted mt-0.5">{trade.subtitle}</p>
      </div>

      {/* Move hurdle — updates with live total */}
      <div className={`px-6 py-4 border-b flex items-center justify-between ${
        isGreen ? 'bg-brazil-green/[0.04] border-brazil-green/10' : 'bg-brazil-blue/[0.04] border-brazil-blue/10'
      }`}>
        <div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest">Move hurdle vs spot</p>
          <p className={`font-mono text-3xl font-semibold text-ink mt-0.5 ${loading ? 'animate-pulse opacity-40' : ''}`}>
            {loading ? trade.moveHurdlePct : `${liveMoveHurdle}%`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-muted uppercase tracking-widest">Total cost</p>
          <p className={`font-mono text-lg font-semibold mt-0.5 ${accentClass} ${loading ? 'animate-pulse opacity-40' : ''}`}>
            {loading ? '...' : fmt(displayTotal)}<span className="text-xs text-muted font-normal ml-1">/sh</span>
          </p>
        </div>
      </div>

      {/* Live option legs */}
      <div className="px-6 pt-4">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Option Legs — ${trade.strike} Strike</p>
        <p className="text-xs font-mono text-muted/60 mb-3">{trade.expiry}</p>

        {loading ? (
          <div className="space-y-3 py-4">
            {[0, 1].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-border/30 animate-pulse" />
            ))}
          </div>
        ) : liveStraddle ? (
          <>
            <OptionLegRow
              leg={liveStraddle.call}
              type="Call"
              accentColor={accentClass}
              mockLast={trade.callPremium}
            />
            <OptionLegRow
              leg={liveStraddle.put}
              type="Put"
              accentColor={accentClass}
              mockLast={trade.putPremium}
            />
          </>
        ) : null}
      </div>

      {/* Straddle totals row */}
      {!loading && liveStraddle && (
        <div className="mx-6 mb-4 mt-3 rounded-xl border border-border bg-paper p-4">
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Straddle Total</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Bid', value: fmt(liveStraddle.totalBid) },
              { label: 'Ask', value: fmt(liveStraddle.totalAsk) },
              { label: 'Mid', value: fmt(liveStraddle.totalMid) },
              { label: 'Last', value: fmt(liveStraddle.totalLast) },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs font-mono text-muted/70 mb-0.5">{label}</p>
                <p className="font-mono text-sm font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>

          {/* Live breakevens */}
          <div className="flex justify-between mt-3 pt-3 border-t border-border">
            <div>
              <p className="text-xs font-mono text-muted/70 mb-0.5">Lower BE</p>
              <p className={`font-mono text-sm font-semibold ${accentClass}`}>
                ${liveBreakevenLow.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-mono text-muted/70 mb-0.5">Strike</p>
              <p className="font-mono text-sm font-semibold text-ink">${trade.strike}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-muted/70 mb-0.5">Upper BE</p>
              <p className={`font-mono text-sm font-semibold ${accentClass}`}>
                ${liveBreakevenHigh.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Why / Risk */}
      <div className="px-6 pb-5">
        <div className="rounded-xl bg-paper p-4 space-y-3">
          <div>
            <p className="text-xs font-mono text-brazil-green uppercase tracking-widest mb-1">Why choose this</p>
            <p className="text-xs font-body text-ink leading-relaxed">{trade.why}</p>
          </div>
          <div>
            <p className="text-xs font-mono text-loss uppercase tracking-widest mb-1">Main risk</p>
            <p className="text-xs font-body text-ink leading-relaxed">{trade.mainRisk}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
