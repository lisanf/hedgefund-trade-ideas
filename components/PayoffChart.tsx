'use client'

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
import { useMarket } from './MarketDataProvider'
import { fmt } from '@/lib/market'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-lg px-3 py-2.5 shadow-lg">
        <p className="text-xs font-mono text-muted mb-1.5">EWZ @ ${Number(label).toFixed(2)}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} className="text-sm font-mono font-medium" style={{ color: entry.color }}>
            {entry.name}:{' '}
            <span className={entry.value >= 0 ? 'text-profit' : 'text-loss'}>
              {entry.value >= 0 ? '+' : ''}${entry.value}
            </span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

interface BreakevenBadgeProps {
  label: string
  low: number
  high: number
  color: string
  isLive: boolean
}

function BreakevenBadge({ label, low, high, color, isLive }: BreakevenBadgeProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-mono text-muted">{label}</p>
        {isLive && (
          <span className="flex items-center gap-1 text-xs font-mono text-profit">
            <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse inline-block" />
            Live
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <p className="text-base font-mono font-semibold" style={{ color }}>
          ${low.toFixed(2)}
        </p>
        <span className="text-muted/50 text-xs font-mono">↔</span>
        <p className="text-base font-mono font-semibold" style={{ color }}>
          ${high.toFixed(2)}
        </p>
      </div>
    </div>
  )
}

export default function PayoffChart() {
  const { data, loading } = useMarket()
  const isLive = data?.source === 'live'

  const oct = trades[0]
  const nov = trades[1]

  // Use live totalMid if available, else totalLast, else mock premium
  const octStraddle = data?.straddles.find(s => s.tradeId === oct.id)
  const novStraddle = data?.straddles.find(s => s.tradeId === nov.id)

  const octPremium = octStraddle?.totalMid ?? octStraddle?.totalLast ?? oct.totalPremium
  const novPremium = novStraddle?.totalMid ?? novStraddle?.totalLast ?? nov.totalPremium

  const liveSpot = data?.spot?.price ?? SPOT_PRICE

  // Derived breakevens from live premium
  const octBELow = oct.strike - octPremium
  const octBEHigh = oct.strike + octPremium
  const novBELow = nov.strike - novPremium
  const novBEHigh = nov.strike + novPremium

  // Generate curves with live premiums
  const octData = generatePayoffData(oct, octPremium)
  const novData = generatePayoffData(nov, novPremium)

  const merged = octData.map((d, i) => ({
    spot: d.spot,
    'Oct 16 (Election)': d.pnl,
    'Nov 20 (+ Runoff)': novData[i]?.pnl ?? 0,
  }))

  return (
    <section id="payoff" className="py-20 px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Payoff Diagram</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink">At-Expiry P&L</h2>
          <p className="text-sm font-body text-muted mt-2 max-w-xl">
            P&L per contract (100 shares) at expiry, calculated from{' '}
            <span className={isLive ? 'text-profit font-medium' : 'text-amber-600 font-medium'}>
              {isLive ? 'live mid prices' : 'mock premiums'}
            </span>
            . Curves and breakevens update automatically when market data refreshes.
          </p>
        </div>

        {/* Live spot readout */}
        <div className="bg-white border border-border rounded-xl px-5 py-3 text-right flex-shrink-0">
          <p className="text-xs font-mono text-muted mb-1">EWZ Spot (chart ref)</p>
          <p className={`font-mono text-xl font-semibold text-ink ${loading ? 'opacity-40 animate-pulse' : ''}`}>
            ${liveSpot.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Breakeven grid — now with live values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <BreakevenBadge
          label="Oct 16 Breakevens"
          low={octBELow}
          high={octBEHigh}
          color="#009C3B"
          isLive={isLive}
        />
        <BreakevenBadge
          label="Nov 20 Breakevens"
          low={novBELow}
          high={novBEHigh}
          color="#002776"
          isLive={isLive}
        />
      </div>

      {/* Premium inputs used for the chart */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          {
            label: 'Oct 16 Premium used',
            value: fmt(octPremium),
            mock: fmt(oct.totalPremium),
            changed: octPremium !== oct.totalPremium,
            color: 'text-brazil-green',
          },
          {
            label: 'Nov 20 Premium used',
            value: fmt(novPremium),
            mock: fmt(nov.totalPremium),
            changed: novPremium !== nov.totalPremium,
            color: 'text-brazil-blue',
          },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-border rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-muted">{item.label}</p>
              {item.changed && (
                <p className="text-xs font-mono text-muted/50 mt-0.5">entry: {item.mock}</p>
              )}
            </div>
            <div className="text-right">
              <p className={`font-mono text-base font-semibold ${item.color}`}>{item.value}/sh</p>
              {item.changed && (
                <p className="text-xs font-mono text-profit mt-0.5">↑ live mid</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* The chart */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={merged} margin={{ top: 16, right: 24, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E1DC" />
            <XAxis
              dataKey="spot"
              tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
              tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono', fill: '#6B6B67' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E1DC' }}
            />
            <YAxis
              tickFormatter={(v) => `$${v}`}
              tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono', fill: '#6B6B67' }}
              tickLine={false}
              axisLine={false}
              width={65}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                fontSize: '12px',
                fontFamily: 'IBM Plex Mono',
                color: '#6B6B67',
                paddingTop: '12px',
              }}
            />

            {/* Zero P&L line */}
            <ReferenceLine y={0} stroke="#141412" strokeWidth={1.5} strokeDasharray="5 4" />

            {/* Live spot reference */}
            <ReferenceLine
              x={parseFloat(liveSpot.toFixed(2))}
              stroke="#6B6B67"
              strokeWidth={1.5}
              label={{
                value: `Spot $${liveSpot.toFixed(2)}`,
                position: 'insideTopRight',
                fontSize: 10,
                fontFamily: 'IBM Plex Mono',
                fill: '#6B6B67',
                dy: -4,
              }}
            />

            {/* Oct breakevens */}
            <ReferenceLine
              x={parseFloat(octBELow.toFixed(2))}
              stroke="#009C3B"
              strokeWidth={1}
              strokeDasharray="3 5"
              opacity={0.7}
              label={{ value: `$${octBELow.toFixed(2)}`, position: 'bottom', fontSize: 9, fontFamily: 'IBM Plex Mono', fill: '#009C3B' }}
            />
            <ReferenceLine
              x={parseFloat(octBEHigh.toFixed(2))}
              stroke="#009C3B"
              strokeWidth={1}
              strokeDasharray="3 5"
              opacity={0.7}
              label={{ value: `$${octBEHigh.toFixed(2)}`, position: 'bottom', fontSize: 9, fontFamily: 'IBM Plex Mono', fill: '#009C3B' }}
            />

            {/* Nov breakevens */}
            <ReferenceLine
              x={parseFloat(novBELow.toFixed(2))}
              stroke="#002776"
              strokeWidth={1}
              strokeDasharray="3 5"
              opacity={0.5}
              label={{ value: `$${novBELow.toFixed(2)}`, position: 'insideBottomLeft', fontSize: 9, fontFamily: 'IBM Plex Mono', fill: '#002776' }}
            />
            <ReferenceLine
              x={parseFloat(novBEHigh.toFixed(2))}
              stroke="#002776"
              strokeWidth={1}
              strokeDasharray="3 5"
              opacity={0.5}
              label={{ value: `$${novBEHigh.toFixed(2)}`, position: 'insideBottomRight', fontSize: 9, fontFamily: 'IBM Plex Mono', fill: '#002776' }}
            />

            <Line
              type="monotone"
              dataKey="Oct 16 (Election)"
              stroke="#009C3B"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#009C3B', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="Nov 20 (+ Runoff)"
              stroke="#002776"
              strokeWidth={2.5}
              dot={false}
              strokeDasharray="7 3"
              activeDot={{ r: 4, fill: '#002776', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <p className="text-xs font-mono text-muted mt-3 text-center">
          Breakeven reference lines auto-update from live mid. Spot ${liveSpot.toFixed(2)} marked.
          {!isLive && <span className="ml-2 text-amber-600">· Using mock premiums</span>}
        </p>
      </div>
    </section>
  )
}
