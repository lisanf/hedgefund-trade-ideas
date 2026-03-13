'use client'

import { trades } from '@/lib/trades'

export default function ComparisonTable() {
  const [oct, nov] = trades

  const rows = [
    { label: 'Total Premium', oct: `$${oct.totalPremium}`, nov: `$${nov.totalPremium}`, highlight: true },
    { label: 'Cost per Contract', oct: `$${oct.costPerContract}`, nov: `$${nov.costPerContract}` },
    { label: 'Move Hurdle vs Spot', oct: oct.moveHurdlePct, nov: nov.moveHurdlePct, highlight: true },
    { label: 'Upper Breakeven', oct: `$${oct.breakEvenHigh}`, nov: `$${nov.breakEvenHigh}` },
    { label: 'Lower Breakeven', oct: `$${oct.breakEvenLow}`, nov: `$${nov.breakEvenLow}` },
    { label: 'Max Loss', oct: `$${oct.maxLoss}/contract`, nov: `$${nov.maxLoss}/contract`, loss: true },
  ]

  return (
    <section className="py-16 px-6 bg-paper">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Side-by-Side Comparison</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-8">Which Window to Choose?</h2>

        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-mono text-muted uppercase tracking-widest">Metric</span>
                </th>
                <th className="px-6 py-4 text-right bg-brazil-green/5">
                  <span className="text-xs font-mono text-brazil-green uppercase tracking-widest">Oct 16</span>
                  <p className="text-xs font-body text-muted font-normal normal-case mt-0.5">Election-only</p>
                </th>
                <th className="px-6 py-4 text-right bg-brazil-blue/5">
                  <span className="text-xs font-mono text-brazil-blue uppercase tracking-widest">Nov 20</span>
                  <p className="text-xs font-body text-muted font-normal normal-case mt-0.5">Election + Runoff</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-paper/50'}`}>
                  <td className="px-6 py-3.5 text-xs font-body text-muted">{row.label}</td>
                  <td className={`px-6 py-3.5 text-right font-mono text-sm font-medium bg-brazil-green/[0.03] ${
                    row.highlight ? 'text-brazil-green' : row.loss ? 'text-loss' : 'text-ink'
                  }`}>
                    {row.oct}
                  </td>
                  <td className={`px-6 py-3.5 text-right font-mono text-sm font-medium bg-brazil-blue/[0.03] ${
                    row.highlight ? 'text-brazil-blue' : row.loss ? 'text-loss' : 'text-ink'
                  }`}>
                    {row.nov}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Why row */}
          <div className="grid grid-cols-2 border-t border-border">
            <div className="px-6 py-4 bg-brazil-green/5 border-r border-border">
              <p className="text-xs font-mono text-brazil-green uppercase tracking-widest mb-1">Choose Oct if...</p>
              <p className="text-xs font-body text-muted leading-relaxed">{oct.why}</p>
            </div>
            <div className="px-6 py-4 bg-brazil-blue/5">
              <p className="text-xs font-mono text-brazil-blue uppercase tracking-widest mb-1">Choose Nov if...</p>
              <p className="text-xs font-body text-muted leading-relaxed">{nov.why}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
