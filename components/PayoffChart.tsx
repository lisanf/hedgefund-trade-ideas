'use client'

import { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  Legend,
} from 'recharts'
import { trades, generatePayoffData, SPOT_PRICE } from '@/lib/trades'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-mono text-muted mb-1">EWZ @ ${label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} className="text-sm font-mono font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value > 0 ? '+' : ''}${entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function PayoffChart() {
  const [hovered, setHovered] = useState<string | null>(null)

  const octData = generatePayoffData(trades[0])
  const novData = generatePayoffData(trades[1])

  // Merge into single dataset by spot price
  const merged = octData.map((d, i) => ({
    spot: d.spot,
    'Oct 16 (Election)': d.pnl,
    'Nov 20 (+ Runoff)': novData[i]?.pnl ?? 0,
  }))

  const oct = trades[0]
  const nov = trades[1]

  return (
    <section id="payoff" className="py-20 px-6 max-w-6xl mx-auto">
      <div className="mb-10">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Payoff Diagram</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-ink">At-Expiry P&L</h2>
        <p className="text-sm font-body text-muted mt-2 max-w-xl">
          P&L per contract (100 shares) at expiry. Both trades share the same shape — Nov is "wider" due to higher premium paid.
        </p>
      </div>

      {/* Breakeven reference table */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Oct Lower BE', value: `$${oct.breakEvenLow}`, color: '#009C3B' },
          { label: 'Oct Upper BE', value: `$${oct.breakEvenHigh}`, color: '#009C3B' },
          { label: 'Nov Lower BE', value: `$${nov.breakEvenLow}`, color: '#002776' },
          { label: 'Nov Upper BE', value: `$${nov.breakEvenHigh}`, color: '#002776' },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-border rounded-xl p-4">
            <p className="text-xs font-mono text-muted mb-1">{item.label}</p>
            <p className="text-xl font-mono font-semibold" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={merged} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E1DC" />
            <XAxis
              dataKey="spot"
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono', fill: '#6B6B67' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E1DC' }}
            />
            <YAxis
              tickFormatter={(v) => `$${v}`}
              tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono', fill: '#6B6B67' }}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', fontFamily: 'IBM Plex Mono', color: '#6B6B67', paddingTop: '12px' }}
            />

            {/* Zero line */}
            <ReferenceLine y={0} stroke="#141412" strokeWidth={1.5} strokeDasharray="4 4" />

            {/* Spot price */}
            <ReferenceLine
              x={SPOT_PRICE}
              stroke="#6B6B67"
              strokeWidth={1}
              strokeDasharray="3 3"
              label={{ value: `Spot $${SPOT_PRICE}`, position: 'top', fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#6B6B67' }}
            />

            {/* Breakevens — Oct */}
            <ReferenceLine x={oct.breakEvenLow} stroke="#009C3B" strokeWidth={1} strokeDasharray="2 4" opacity={0.6} />
            <ReferenceLine x={oct.breakEvenHigh} stroke="#009C3B" strokeWidth={1} strokeDasharray="2 4" opacity={0.6} />

            {/* Breakevens — Nov */}
            <ReferenceLine x={nov.breakEvenLow} stroke="#002776" strokeWidth={1} strokeDasharray="2 4" opacity={0.4} />
            <ReferenceLine x={nov.breakEvenHigh} stroke="#002776" strokeWidth={1} strokeDasharray="2 4" opacity={0.4} />

            <Line
              type="monotone"
              dataKey="Oct 16 (Election)"
              stroke="#009C3B"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#009C3B' }}
            />
            <Line
              type="monotone"
              dataKey="Nov 20 (+ Runoff)"
              stroke="#002776"
              strokeWidth={2.5}
              dot={false}
              strokeDasharray="6 3"
              activeDot={{ r: 4, fill: '#002776' }}
            />
          </LineChart>
        </ResponsiveContainer>

        <p className="text-xs font-mono text-muted mt-2 text-center">
          Dashed vertical lines = breakeven levels. Solid dark dash = break-even P&L (zero). Spot ${SPOT_PRICE} marked.
        </p>
      </div>
    </section>
  )
}
