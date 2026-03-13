'use client'

import { Trade, SPOT_PRICE } from '@/lib/trades'

interface Props {
  trade: Trade
  index: number
}

export default function TradeCard({ trade, index }: Props) {
  const isGreen = trade.color === 'green'

  const rows = [
    { label: 'Structure', value: trade.structure },
    { label: 'Strike', value: `$${trade.strike}`, mono: true },
    { label: 'Expiry', value: trade.expiry, mono: true },
    { label: 'Call (last)', value: `$${trade.callPremium.toFixed(2)}`, mono: true, highlight: true },
    { label: 'Put (last)', value: `$${trade.putPremium.toFixed(2)}`, mono: true, highlight: true },
    { label: 'Total Premium', value: `$${trade.totalPremium.toFixed(2)}/sh`, mono: true, bold: true },
    { label: 'Cost per Contract', value: `$${trade.costPerContract}`, mono: true, bold: true },
    { label: 'Max Loss', value: `$${trade.maxLoss}`, mono: true, loss: true },
    { label: 'Breakeven Low', value: `$${trade.breakEvenLow}`, mono: true },
    { label: 'Breakeven High', value: `$${trade.breakEvenHigh}`, mono: true },
  ]

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden transition-shadow hover:shadow-lg ${
        isGreen ? 'border-brazil-green/20' : 'border-brazil-blue/20'
      }`}
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      {/* Card header */}
      <div className={`px-6 py-5 border-b ${isGreen ? 'border-brazil-green/15 bg-brazil-green/5' : 'border-brazil-blue/15 bg-brazil-blue/5'}`}>
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-full ${
            isGreen
              ? 'bg-brazil-green text-white'
              : 'bg-brazil-blue text-white'
          }`}>
            {trade.badge}
          </span>
          <span className="text-xs font-mono text-muted">{trade.ticker}</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-ink tracking-tight">{trade.title}</h2>
        <p className="text-sm font-body text-muted mt-0.5">{trade.subtitle}</p>
      </div>

      {/* Move hurdle highlight */}
      <div className={`px-6 py-4 border-b flex items-center justify-between ${
        isGreen ? 'bg-brazil-green/[0.04] border-brazil-green/10' : 'bg-brazil-blue/[0.04] border-brazil-blue/10'
      }`}>
        <div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest">Move hurdle vs spot</p>
          <p className="font-mono text-3xl font-semibold text-ink mt-0.5">{trade.moveHurdlePct}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-muted uppercase tracking-widest">Required by expiry</p>
          <p className="text-sm font-body text-muted mt-0.5">±${trade.totalPremium} / ${SPOT_PRICE}</p>
        </div>
      </div>

      {/* Trade rows */}
      <div className="px-6 py-4">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Trade Ticket</p>
        <div className="space-y-0">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-xs font-body text-muted">{row.label}</span>
              <span className={`text-sm ${
                row.bold ? 'font-semibold text-ink' :
                row.loss ? 'font-mono text-loss' :
                row.highlight ? `font-mono ${isGreen ? 'text-brazil-green' : 'text-brazil-blue'}` :
                row.mono ? 'font-mono text-ink' : 'font-body text-ink text-right max-w-[55%]'
              }`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Why / Risk footer */}
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
