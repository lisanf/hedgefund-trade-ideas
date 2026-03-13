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
  const accentClass = isGreen ? 'text-br-green' : 'text-br-blue'
  const borderAccent = isGreen ? 'border-br-green/20' : 'border-br-blue/20'
  const bgAccent = isGreen ? 'bg-br-green/5' : 'bg-br-blue/5'

  const { data, loading } = useMarket()
  const liveStraddle = data?.straddles.find((s) => s.tradeId === trade.id)
  const isLive = data?.source === 'live'

  const displayTotal = liveStraddle?.totalMid
    ?? liveStraddle?.totalLast
    ?? trade.totalPremium

  const currentSpot = data?.spot?.price ?? SPOT_PRICE
  const liveBELow = trade.strike - displayTotal
  const liveBEHigh = trade.strike + displayTotal
  const liveMoveHurdle = ((displayTotal / currentSpot) * 100).toFixed(1)

  return (
    <div className={`card overflow-hidden border ${borderAccent} transition-all hover:shadow-md`}>
      {/* Card header band */}
      <div className={`px-5 py-4 border-b border-rule flex items-center justify-between ${bgAccent}`}>
        <div className="flex items-center gap-2.5">
          <span className={`font-mono text-[10px] font-medium px-2 py-0.5 rounded ${
            isGreen ? 'bg-br-green text-white' : 'bg-br-blue text-white'
          }`}>
            {trade.badge}
          </span>
          <span className="label">{trade.ticker}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="label">{trade.expiry}</span>
          {isLive && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
              <span className="font-mono text-[10px] text-profit">LIVE</span>
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-5">
        {/* Title */}
        <h2 className="heading-lg text-xl text-ink mb-0.5">{trade.title}</h2>
        <p className="text-sm font-sans text-secondary mb-5">{trade.subtitle}</p>

        {/* Move hurdle hero stat */}
        <div className={`rounded-xl px-4 py-3.5 mb-5 flex items-center justify-between ${bgAccent}`}>
          <div>
            <p className="label mb-1">Move hurdle vs spot</p>
            <p className={`font-mono text-2xl font-medium ${loading ? 'opacity-30' : ''} text-ink`}>
              {loading ? '—' : `${liveMoveHurdle}%`}
            </p>
          </div>
          <div className="text-right">
            <p className="label mb-1">Total cost</p>
            <p className={`font-mono text-lg font-medium ${accentClass} ${loading ? 'opacity-30' : ''}`}>
              {loading ? '—' : fmt(displayTotal)}<span className="font-mono text-xs text-tertiary ml-1">/sh</span>
            </p>
          </div>
        </div>

        {/* Option legs */}
        <p className="label mb-3">Option legs · ${trade.strike} strike</p>
        {loading ? (
          <div className="space-y-2.5">
            {[0, 1].map(i => (
              <div key={i} className="h-16 rounded-lg bg-rule/50 animate-pulse" />
            ))}
          </div>
        ) : liveStraddle ? (
          <div className="space-y-0">
            <OptionLegRow leg={liveStraddle.call} type="Call" accentColor={accentClass} mockLast={trade.callPremium} />
            <OptionLegRow leg={liveStraddle.put} type="Put" accentColor={accentClass} mockLast={trade.putPremium} />
          </div>
        ) : null}

        {/* Straddle total + live breakevens */}
        {!loading && liveStraddle && (
          <div className="mt-4 pt-4 border-t border-rule">
            <p className="label mb-3">Straddle total</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { l: 'Bid', v: fmt(liveStraddle.totalBid) },
                { l: 'Ask', v: fmt(liveStraddle.totalAsk) },
                { l: 'Mid', v: fmt(liveStraddle.totalMid) },
                { l: 'Last', v: fmt(liveStraddle.totalLast) },
              ].map(({ l, v }) => (
                <div key={l} className="text-center bg-canvas rounded-lg py-2">
                  <p className="label mb-0.5">{l}</p>
                  <p className={`font-mono text-xs font-medium ${l === 'Mid' ? 'text-ink' : 'text-secondary'}`}>{v}</p>
                </div>
              ))}
            </div>

            {/* Breakevens */}
            <div className="flex items-center justify-between text-center">
              <div>
                <p className="label mb-1">Lower BE</p>
                <p className={`font-mono text-sm font-medium ${accentClass}`}>${liveBELow.toFixed(2)}</p>
              </div>
              <div className="flex-1 flex items-center gap-2 px-4">
                <div className="flex-1 h-px bg-rule" />
                <p className="font-mono text-xs text-tertiary">${trade.strike}</p>
                <div className="flex-1 h-px bg-rule" />
              </div>
              <div>
                <p className="label mb-1">Upper BE</p>
                <p className={`font-mono text-sm font-medium ${accentClass}`}>${liveBEHigh.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Why / risk */}
        <div className="mt-4 pt-4 border-t border-rule grid grid-cols-2 gap-3">
          <div>
            <p className="font-mono text-[10px] text-br-green uppercase tracking-widest mb-1">Why this</p>
            <p className="text-xs font-sans text-secondary leading-relaxed">{trade.why}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-loss uppercase tracking-widest mb-1">Main risk</p>
            <p className="text-xs font-sans text-secondary leading-relaxed">{trade.mainRisk}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
