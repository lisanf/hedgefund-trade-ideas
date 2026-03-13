'use client'

// components/OptionLegRow.tsx
// Shows one option leg (call or put) with bid/ask/last/mid/IV in a clean table row

import { OptionLeg, fmt, fmtIV } from '@/lib/market'

interface Props {
  leg: OptionLeg
  type: 'Call' | 'Put'
  accentColor: string   // tailwind color class e.g. 'text-brazil-green'
  mockLast?: number     // original mock value for comparison
}

export default function OptionLegRow({ leg, type, accentColor, mockLast }: Props) {
  const isLive = leg.bid != null || leg.ask != null

  return (
    <div className="py-3 border-b border-border last:border-0">
      {/* Leg label */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-mono font-semibold uppercase tracking-widest ${accentColor}`}>
          {type} · ${leg.strike} Strike
        </span>
        {leg.iv != null && (
          <span className="text-xs font-mono text-muted bg-border/50 px-2 py-0.5 rounded-full">
            IV {fmtIV(leg.iv)}
          </span>
        )}
      </div>

      {/* Bid / Ask / Mid / Last grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Bid', value: fmt(leg.bid), highlight: false },
          { label: 'Ask', value: fmt(leg.ask), highlight: false },
          { label: 'Mid', value: fmt(leg.mid), highlight: true },
          { label: 'Last', value: fmt(leg.last), highlight: false },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`rounded-lg px-2 py-2 text-center ${highlight ? 'bg-paper border border-border' : ''}`}>
            <p className="text-xs font-mono text-muted/70 mb-0.5">{label}</p>
            <p className={`font-mono text-sm font-medium ${
              highlight ? 'text-ink' : value === '—' ? 'text-muted/40' : 'text-ink'
            }`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Volume / OI */}
      {(leg.volume != null || leg.openInterest != null) && (
        <div className="flex gap-4 mt-2">
          {leg.volume != null && (
            <span className="text-xs font-mono text-muted/60">Vol: {leg.volume.toLocaleString()}</span>
          )}
          {leg.openInterest != null && (
            <span className="text-xs font-mono text-muted/60">OI: {leg.openInterest.toLocaleString()}</span>
          )}
        </div>
      )}
    </div>
  )
}
