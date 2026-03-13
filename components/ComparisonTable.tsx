'use client'

import { trades, SPOT_PRICE } from '@/lib/trades'
import { fmt } from '@/lib/market'
import { useMarket } from './MarketDataProvider'

function Delta({ live, entry }: { live: number | null; entry: number }) {
  if (live == null) return <span className="text-muted/40 text-xs font-mono">—</span>
  const delta = live - entry
  const pct = ((delta / entry) * 100).toFixed(1)
  if (Math.abs(delta) < 0.01) return <span className="text-muted/50 text-xs font-mono">no chg</span>
  return (
    <span className={`text-xs font-mono font-medium ${delta > 0 ? 'text-profit' : 'text-loss'}`}>
      {delta > 0 ? '+' : ''}{delta.toFixed(2)} ({delta > 0 ? '+' : ''}{pct}%)
    </span>
  )
}

function Cell({
  value,
  highlight,
  loss,
  colorClass,
  subValue,
}: {
  value: string
  highlight?: boolean
  loss?: boolean
  colorClass?: string
  subValue?: React.ReactNode
}) {
  return (
    <td className={`px-5 py-3.5 text-right ${highlight ? colorClass ?? '' : ''}`}>
      <p className={`font-mono text-sm font-medium ${
        highlight ? '' : loss ? 'text-loss' : 'text-ink'
      }`}>
        {value}
      </p>
      {subValue && <div className="mt-0.5">{subValue}</div>}
    </td>
  )
}

export default function ComparisonTable() {
  const [oct, nov] = trades
  const { data, loading } = useMarket()
  const isLive = data?.source === 'live'

  const octS = data?.straddles.find(s => s.tradeId === oct.id)
  const novS = data?.straddles.find(s => s.tradeId === nov.id)

  const liveSpot = data?.spot?.price ?? SPOT_PRICE

  // Live totals — prefer mid, fall back to last
  const octLiveMid = octS?.totalMid ?? null
  const novLiveMid = novS?.totalMid ?? null
  const octLiveLast = octS?.totalLast ?? null
  const novLiveLast = novS?.totalLast ?? null
  const octUsed = octLiveMid ?? octLiveLast ?? oct.totalPremium
  const novUsed = novLiveMid ?? novLiveLast ?? nov.totalPremium

  // Live-derived breakevens & hurdle
  const octBELow = (oct.strike - octUsed).toFixed(2)
  const octBEHigh = (oct.strike + octUsed).toFixed(2)
  const novBELow = (nov.strike - novUsed).toFixed(2)
  const novBEHigh = (nov.strike + novUsed).toFixed(2)
  const octHurdle = ((octUsed / liveSpot) * 100).toFixed(1) + '%'
  const novHurdle = ((novUsed / liveSpot) * 100).toFixed(1) + '%'

  const rows = [
    {
      label: 'Entry Premium (last)',
      octVal: `$${oct.totalPremium}`,
      novVal: `$${nov.totalPremium}`,
      note: 'Original quoted last',
    },
    {
      label: 'Live Bid',
      octVal: fmt(octS?.totalBid ?? null),
      novVal: fmt(novS?.totalBid ?? null),
      note: 'Sum of legs bid',
      live: true,
    },
    {
      label: 'Live Ask',
      octVal: fmt(octS?.totalAsk ?? null),
      novVal: fmt(novS?.totalAsk ?? null),
      note: 'Sum of legs ask',
      live: true,
    },
    {
      label: 'Live Mid',
      octVal: fmt(octLiveMid),
      novVal: fmt(novLiveMid),
      note: '(bid+ask)/2 — best estimate',
      highlight: true,
      live: true,
      octDelta: <Delta live={octLiveMid} entry={oct.totalPremium} />,
      novDelta: <Delta live={novLiveMid} entry={nov.totalPremium} />,
    },
    {
      label: 'Live Last',
      octVal: fmt(octLiveLast),
      novVal: fmt(novLiveLast),
      note: 'Last traded straddle',
      live: true,
    },
    {
      label: 'Move Hurdle vs Spot',
      octVal: loading ? '...' : octHurdle,
      novVal: loading ? '...' : novHurdle,
      highlight: true,
      note: `vs $${liveSpot.toFixed(2)} spot`,
    },
    {
      label: 'Upper Breakeven',
      octVal: loading ? '...' : `$${octBEHigh}`,
      novVal: loading ? '...' : `$${novBEHigh}`,
      note: 'From live mid',
    },
    {
      label: 'Lower Breakeven',
      octVal: loading ? '...' : `$${octBELow}`,
      novVal: loading ? '...' : `$${novBELow}`,
      note: 'From live mid',
    },
    {
      label: 'Max Loss / Contract',
      octVal: `$${oct.maxLoss}`,
      novVal: `$${nov.maxLoss}`,
      loss: true,
      note: 'Premium paid × 100',
    },
  ]

  return (
    <section className="py-16 px-6 bg-paper">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Side-by-Side Comparison</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink">Which Window?</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted bg-white border border-border rounded-lg px-3 py-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-profit animate-pulse' : 'bg-amber-400'}`} />
            {isLive ? 'Live mid prices' : 'Mock / fallback data'}
            {' '}·{' '}
            <span className="text-muted/70">EWZ ${liveSpot.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-4 text-left w-[38%]">
                  <span className="text-xs font-mono text-muted uppercase tracking-widest">Metric</span>
                </th>
                <th className="px-5 py-4 text-right bg-brazil-green/5 w-[31%]">
                  <span className="text-xs font-mono text-brazil-green uppercase tracking-widest">Oct 16</span>
                  <p className="text-xs font-body text-muted font-normal normal-case tracking-normal mt-0.5">Election-only</p>
                </th>
                <th className="px-5 py-4 text-right bg-brazil-blue/5 w-[31%]">
                  <span className="text-xs font-mono text-brazil-blue uppercase tracking-widest">Nov 20</span>
                  <p className="text-xs font-body text-muted font-normal normal-case tracking-normal mt-0.5">Election + Runoff</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-b border-border last:border-0 ${
                    row.highlight
                      ? 'bg-ink/[0.02]'
                      : i % 2 === 0 ? '' : 'bg-paper/60'
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-start gap-2">
                      {row.live && (
                        <span className={`mt-0.5 w-1.5 h-1.5 flex-shrink-0 rounded-full ${isLive ? 'bg-profit' : 'bg-amber-400'}`} />
                      )}
                      <div>
                        <p className={`text-xs font-body ${row.highlight ? 'font-semibold text-ink' : 'text-muted'}`}>
                          {row.label}
                        </p>
                        {row.note && (
                          <p className="text-xs font-mono text-muted/50 mt-0.5">{row.note}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <Cell
                    value={row.octVal}
                    highlight={row.highlight}
                    loss={row.loss}
                    colorClass="text-brazil-green"
                    subValue={row.octDelta}
                  />
                  <Cell
                    value={row.novVal}
                    highlight={row.highlight}
                    loss={row.loss}
                    colorClass="text-brazil-blue"
                    subValue={row.novDelta}
                  />
                </tr>
              ))}
            </tbody>
          </table>

          {/* Why footer */}
          <div className="grid grid-cols-2 border-t border-border">
            <div className="px-5 py-4 bg-brazil-green/5 border-r border-border">
              <p className="text-xs font-mono text-brazil-green uppercase tracking-widest mb-1">Choose Oct if...</p>
              <p className="text-xs font-body text-muted leading-relaxed">{oct.why}</p>
            </div>
            <div className="px-5 py-4 bg-brazil-blue/5">
              <p className="text-xs font-mono text-brazil-blue uppercase tracking-widest mb-1">Choose Nov if...</p>
              <p className="text-xs font-body text-muted leading-relaxed">{nov.why}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
