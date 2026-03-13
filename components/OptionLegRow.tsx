'use client'

import { OptionLeg, fmt, fmtIV } from '@/lib/market'

interface Props {
  leg: OptionLeg
  type: 'Call' | 'Put'
  accentColor: string
  mockLast?: number
}

export default function OptionLegRow({ leg, type, accentColor }: Props) {
  return (
    <div className="py-3 border-b border-rule last:border-0">
      {/* Leg label + IV */}
      <div className="flex items-center justify-between mb-2">
        <span className={`font-mono text-[10px] font-medium uppercase tracking-widest ${accentColor}`}>
          {type} · ${leg.strike}
        </span>
        {leg.iv != null && (
          <span className="font-mono text-[10px] text-tertiary bg-canvas border border-rule px-2 py-0.5 rounded-full">
            IV {fmtIV(leg.iv)}
          </span>
        )}
      </div>

      {/* Bid / Ask / Mid / Last */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: 'Bid',  value: fmt(leg.bid),  bold: false },
          { label: 'Ask',  value: fmt(leg.ask),  bold: false },
          { label: 'Mid',  value: fmt(leg.mid),  bold: true  },
          { label: 'Last', value: fmt(leg.last), bold: false },
        ].map(({ label, value, bold }) => (
          <div
            key={label}
            className={`rounded-lg px-2 py-1.5 text-center ${
              bold ? 'bg-canvas border border-rule' : ''
            }`}
          >
            <p className="label mb-0.5">{label}</p>
            <p className={`font-mono text-xs ${
              bold ? 'font-medium text-ink' :
              value === '—' ? 'text-tertiary' : 'text-secondary'
            }`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Vol + OI */}
      {(leg.volume != null || leg.openInterest != null) && (
        <div className="flex gap-4 mt-1.5">
          {leg.volume != null && (
            <span className="font-mono text-[10px] text-tertiary">
              Vol {leg.volume.toLocaleString()}
            </span>
          )}
          {leg.openInterest != null && (
            <span className="font-mono text-[10px] text-tertiary">
              OI {leg.openInterest.toLocaleString()}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
