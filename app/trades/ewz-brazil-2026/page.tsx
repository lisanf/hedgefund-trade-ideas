'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, ReferenceLine, Tooltip, Legend,
} from 'recharts'
import { useMarket } from '@/components/MarketProvider'
import { changeColor, fmt, fmtIV } from '@/lib/market'
import { trades, electionDates, generatePayoffData, SPOT_PRICE } from '@/lib/trades'
import { RefreshCw } from 'lucide-react'

// ─── helpers ──────────────────────────────────────────────────────────────
function dte(expiryDate: string): number {
  const today = new Date(); today.setHours(0,0,0,0)
  const exp   = new Date(expiryDate)
  return Math.max(0, Math.round((exp.getTime() - today.getTime()) / 86400000))
}
function dteColor(d: number)  { return d <= 7 ? 'text-loss' : d <= 21 ? 'text-amber-500' : 'text-ink' }
function dteBorder(d: number) { return d <= 7 ? 'border-red-200 bg-red-50' : d <= 21 ? 'border-amber-200 bg-amber-50' : 'border-rule bg-canvas' }
function pnlColor(v: number)  { return v > 0 ? 'text-profit' : v < 0 ? 'text-loss' : 'text-secondary' }
function pnlBg(v: number)     { return v > 0 ? 'bg-green-50' : v < 0 ? 'bg-red-50' : 'bg-canvas' }
function fmtTime(d: Date | null) {
  if (!d) return '—'
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

// ─── NAV ──────────────────────────────────────────────────────────────────
function Nav() {
  const { data, refresh } = useMarket()
  const spot   = data?.spot
  const isLive = data?.source === 'live'
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-canvas/90 backdrop-blur-md border-b border-rule">
      <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between gap-4">
        <Link href="/" className="font-syne font-bold text-sm text-ink hover:text-secondary transition-colors">
          ← SIGNALS
        </Link>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-secondary">
            EWZ{' '}
            {spot
              ? <><span className="text-ink font-medium">${spot.price.toFixed(2)}</span>
                  <span className={`ml-1.5 ${changeColor(spot.changePct)}`}>{spot.changePct >= 0 ? '+' : ''}{spot.changePct.toFixed(2)}%</span></>
              : <span className="text-tertiary animate-pulse">——</span>
            }
          </span>
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />}
          <button onClick={refresh} className="text-tertiary hover:text-ink transition-colors" title="Refresh">
            <RefreshCw size={12} />
          </button>
        </div>
        <nav className="hidden md:flex items-center gap-5 text-xs font-mono text-secondary">
          <a href="#thesis"  className="hover:text-ink transition-colors">Thesis</a>
          <a href="#trades"  className="hover:text-ink transition-colors">Trades</a>
          <a href="#payoff"  className="hover:text-ink transition-colors">Payoff</a>
          <a href="#tracker" className="hover:text-ink transition-colors">Tracker</a>
        </nav>
      </div>
    </header>
  )
}

// ─── SPOT CARD ────────────────────────────────────────────────────────────
function SpotCard() {
  const { data, loading, lastUpdated } = useMarket()
  const spot   = data?.spot
  const isLive = data?.source === 'live'
  return (
    <div className="card px-6 py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label mb-2">EWZ Spot Price</p>
          {loading
            ? <p className="font-mono text-4xl font-medium text-tertiary animate-pulse">$——.——</p>
            : <div className="flex items-baseline gap-3">
                <p className="font-mono text-4xl font-medium text-ink">${spot?.price.toFixed(2) ?? '—'}</p>
                {spot && <p className={`font-mono text-base font-medium ${changeColor(spot.change)}`}>
                  {spot.change >= 0 ? '+' : ''}{spot.change.toFixed(2)} ({spot.changePct >= 0 ? '+' : ''}{spot.changePct.toFixed(2)}%)
                </p>}
              </div>
          }
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-profit animate-pulse' : 'bg-amber-400'}`} />
            <span className={`font-mono text-xs font-medium ${isLive ? 'text-profit' : 'text-amber-500'}`}>
              {isLive ? 'Live' : 'Mock'}
            </span>
            <span className="font-mono text-xs text-tertiary">· ~15min delay</span>
          </div>
          <p className="font-mono text-xs text-tertiary">Last update: {fmtTime(lastUpdated)}</p>
          <p className="font-mono text-xs text-tertiary mt-0.5">Prev close: {spot ? `$${spot.previousClose.toFixed(2)}` : '—'}</p>
        </div>
      </div>
    </div>
  )
}

// ─── TIMELINE ─────────────────────────────────────────────────────────────
function Timeline() {
  return (
    <div className="card p-6">
      <p className="label mb-6">Election calendar & trade windows</p>
      <div className="hidden md:flex items-start">
        {electionDates.map((item, i) => (
          <div key={i} className="flex-1 relative">
            {i < electionDates.length - 1 && (
              <div className="absolute top-2.5 left-1/2 right-0 h-px bg-rule" />
            )}
            <div className="relative flex flex-col items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 z-10 ${
                item.type === 'expiry' ? 'bg-ink border-ink'
                : item.type === 'event' ? 'border-lime-dark bg-lime'
                : 'bg-canvas border-rule'}`}
              />
              <div className="text-center px-1">
                <p className={`font-mono text-xs font-medium mb-1 ${
                  item.type === 'expiry' ? 'text-ink'
                  : item.type === 'event' ? 'text-lime-dark'
                  : 'text-tertiary'}`}>
                  {item.type === 'expiry' ? 'EXPIRY' : item.type === 'event' ? 'ELECTION' : 'PERIOD'}
                </p>
                <p className="font-sans text-xs text-ink font-medium">{item.label}</p>
                <p className="font-mono text-xs text-tertiary mt-0.5">{item.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="md:hidden space-y-4">
        {electionDates.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full mt-0.5 ${item.type==='expiry'?'bg-ink':item.type==='event'?'bg-lime':'bg-rule'}`} />
              {i < electionDates.length - 1 && <div className="w-px h-7 bg-rule mt-1" />}
            </div>
            <div>
              <p className="font-sans text-sm font-medium text-ink">{item.label}</p>
              <p className="font-mono text-xs text-tertiary">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── OPTION LEG ROW ───────────────────────────────────────────────────────
function LegRow({ leg, type, accent }: { leg: any; type: string; accent: string }) {
  return (
    <div className="py-3 border-b border-rule last:border-0">
      <div className="flex items-center justify-between mb-2">
        <span className={`font-mono text-xs font-medium uppercase tracking-widest ${accent}`}>
          {type} · ${leg.strike}
        </span>
        {leg.iv != null && (
          <span className="font-mono text-xs text-tertiary bg-canvas border border-rule px-2 py-0.5 rounded-full">
            IV {fmtIV(leg.iv)}
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[{l:'Bid',v:fmt(leg.bid)},{l:'Ask',v:fmt(leg.ask)},{l:'Mid',v:fmt(leg.mid),bold:true},{l:'Last',v:fmt(leg.last)}].map(({l,v,bold})=>(
          <div key={l} className={`rounded-lg px-2 py-2 text-center ${bold ? 'bg-canvas border border-rule' : ''}`}>
            <p className="label mb-0.5">{l}</p>
            <p className={`font-mono text-xs ${bold ? 'font-medium text-ink' : v==='—' ? 'text-tertiary' : 'text-secondary'}`}>{v}</p>
          </div>
        ))}
      </div>
      {(leg.volume != null || leg.openInterest != null) && (
        <div className="flex gap-4 mt-1.5">
          {leg.volume != null && <span className="font-mono text-xs text-tertiary">Vol {leg.volume.toLocaleString()}</span>}
          {leg.openInterest != null && <span className="font-mono text-xs text-tertiary">OI {leg.openInterest.toLocaleString()}</span>}
        </div>
      )}
    </div>
  )
}

// ─── TRADE CARD ───────────────────────────────────────────────────────────
function TradeCard({ trade, index }: { trade: typeof trades[0]; index: number }) {
  const isGreen   = trade.color === 'green'
  const accent    = isGreen ? 'text-br-green' : 'text-br-blue'
  const accentBg  = isGreen ? 'bg-br-green/5'  : 'bg-br-blue/5'
  const badgeBg   = isGreen ? 'bg-br-green text-white' : 'bg-br-blue text-white'
  const borderCol = isGreen ? 'border-br-green/20' : 'border-br-blue/20'

  const { data, loading } = useMarket()
  const s       = data?.straddles.find(x => x.tradeId === trade.id)
  const isLive  = data?.source === 'live'
  const spot    = data?.spot?.price ?? SPOT_PRICE
  const prem    = s?.totalMid ?? s?.totalLast ?? trade.totalPremium
  const beLow   = trade.strike - prem
  const beHigh  = trade.strike + prem
  const hurdle  = ((prem / spot) * 100).toFixed(1)

  return (
    <div className={`card border ${borderCol} overflow-hidden`}>
      <div className={`px-5 py-4 border-b border-rule flex items-center justify-between ${accentBg}`}>
        <div className="flex items-center gap-2">
          <span className={`font-mono text-xs px-2 py-0.5 rounded ${badgeBg}`}>{trade.badge}</span>
          <span className="label">{trade.ticker}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="label">{trade.expiry}</span>
          {isLive && <><span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" /><span className="font-mono text-xs text-profit">LIVE</span></>}
        </div>
      </div>

      <div className="px-5 py-5">
        <h2 className="heading-lg text-xl text-ink mb-0.5">{trade.title}</h2>
        <p className="text-sm font-sans text-secondary mb-5">{trade.subtitle}</p>

        <div className={`rounded-xl px-4 py-4 mb-5 flex items-center justify-between ${accentBg}`}>
          <div>
            <p className="label mb-1">Move hurdle vs spot</p>
            <p className="font-mono text-2xl font-medium text-ink">{loading ? '—' : `${hurdle}%`}</p>
          </div>
          <div className="text-right">
            <p className="label mb-1">Total cost</p>
            <p className={`font-mono text-xl font-medium ${accent}`}>{loading ? '—' : fmt(prem)}<span className="text-xs text-tertiary ml-1">/sh</span></p>
          </div>
        </div>

        <p className="label mb-3">Option legs · ${trade.strike} strike</p>
        {loading
          ? <div className="space-y-2">{[0,1].map(i=><div key={i} className="h-16 rounded-lg bg-rule/50 animate-pulse"/>)}</div>
          : s && <><LegRow leg={s.call} type="Call" accent={accent} /><LegRow leg={s.put} type="Put" accent={accent} /></>
        }

        {!loading && s && (
          <div className="mt-4 pt-4 border-t border-rule">
            <p className="label mb-3">Straddle total</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[{l:'Bid',v:fmt(s.totalBid)},{l:'Ask',v:fmt(s.totalAsk)},{l:'Mid',v:fmt(s.totalMid)},{l:'Last',v:fmt(s.totalLast)}].map(({l,v})=>(
                <div key={l} className="text-center bg-canvas rounded-lg py-2">
                  <p className="label mb-0.5">{l}</p>
                  <p className={`font-mono text-xs font-medium ${l==='Mid'?'text-ink':'text-secondary'}`}>{v}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div><p className="label mb-1">Lower BE</p><p className={`font-mono text-sm font-medium ${accent}`}>${beLow.toFixed(2)}</p></div>
              <div className="flex-1 flex items-center gap-2 px-4">
                <div className="flex-1 h-px bg-rule"/><p className="font-mono text-xs text-tertiary">${trade.strike}</p><div className="flex-1 h-px bg-rule"/>
              </div>
              <div className="text-right"><p className="label mb-1">Upper BE</p><p className={`font-mono text-sm font-medium ${accent}`}>${beHigh.toFixed(2)}</p></div>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-rule grid grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-xs text-br-green uppercase tracking-widest mb-1">Why this</p>
            <p className="text-xs font-sans text-secondary leading-relaxed">{trade.why}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-loss uppercase tracking-widest mb-1">Main risk</p>
            <p className="text-xs font-sans text-secondary leading-relaxed">{trade.mainRisk}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── COMPARISON TABLE ─────────────────────────────────────────────────────
function ComparisonTable() {
  const [oct, nov] = trades
  const { data, loading } = useMarket()
  const isLive = data?.source === 'live'
  const spot   = data?.spot?.price ?? SPOT_PRICE
  const octS   = data?.straddles.find(s => s.tradeId === oct.id)
  const novS   = data?.straddles.find(s => s.tradeId === nov.id)
  const octMid = octS?.totalMid ?? octS?.totalLast ?? oct.totalPremium
  const novMid = novS?.totalMid ?? novS?.totalLast ?? nov.totalPremium

  const rows = [
    { label: 'Entry Premium (last)',   ov: `$${oct.totalPremium}`,                   nv: `$${nov.totalPremium}`,                   note: 'Original quoted last' },
    { label: 'Live Bid',               ov: fmt(octS?.totalBid ?? null),              nv: fmt(novS?.totalBid ?? null),              note: 'Sum of legs bid',   live: true },
    { label: 'Live Ask',               ov: fmt(octS?.totalAsk ?? null),              nv: fmt(novS?.totalAsk ?? null),              note: 'Sum of legs ask',   live: true },
    { label: 'Live Mid',               ov: fmt(octMid),                              nv: fmt(novMid),                              note: 'Best entry estimate', live: true, hi: true },
    { label: 'Live Last',              ov: fmt(octS?.totalLast ?? null),             nv: fmt(novS?.totalLast ?? null),             note: 'Last traded',       live: true },
    { label: 'Move Hurdle vs Spot',    ov: loading ? '…' : `${((octMid/spot)*100).toFixed(1)}%`, nv: loading ? '…' : `${((novMid/spot)*100).toFixed(1)}%`, note: `vs $${spot.toFixed(2)}`, hi: true },
    { label: 'Upper Breakeven',        ov: loading ? '…' : `$${(oct.strike+octMid).toFixed(2)}`, nv: loading ? '…' : `$${(nov.strike+novMid).toFixed(2)}`, note: 'From live mid' },
    { label: 'Lower Breakeven',        ov: loading ? '…' : `$${(oct.strike-octMid).toFixed(2)}`, nv: loading ? '…' : `$${(nov.strike-novMid).toFixed(2)}`, note: 'From live mid' },
    { label: 'Max Loss / Contract',    ov: `$${oct.costPerContract}`,                nv: `$${nov.costPerContract}`,                note: 'Premium × 100',     loss: true },
  ]

  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-rule">
            <th className="px-5 py-4 text-left w-5/12"><span className="label">Metric</span></th>
            <th className="px-5 py-4 text-right bg-br-green/5 w-3/12">
              <span className="font-mono text-xs text-br-green uppercase tracking-widest">Oct 16</span>
              <p className="label normal-case tracking-normal mt-0.5 font-normal">Election-only</p>
            </th>
            <th className="px-5 py-4 text-right bg-br-blue/5 w-3/12">
              <span className="font-mono text-xs text-br-blue uppercase tracking-widest">Nov 20</span>
              <p className="label normal-case tracking-normal mt-0.5 font-normal">Election + Runoff</p>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} className={`border-b border-rule last:border-0 ${row.hi ? 'bg-ink/[0.02]' : i%2===0?'':'bg-canvas/50'}`}>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  {row.live && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLive?'bg-profit':'bg-amber-400'}`} />}
                  <div>
                    <p className={`text-xs font-sans ${row.hi ? 'font-semibold text-ink' : 'text-secondary'}`}>{row.label}</p>
                    {row.note && <p className="font-mono text-xs text-tertiary">{row.note}</p>}
                  </div>
                </div>
              </td>
              <td className={`px-5 py-3 text-right font-mono text-sm font-medium bg-br-green/5 ${row.hi?'text-br-green':row.loss?'text-loss':'text-ink'}`}>{row.ov}</td>
              <td className={`px-5 py-3 text-right font-mono text-sm font-medium bg-br-blue/5 ${row.hi?'text-br-blue':row.loss?'text-loss':'text-ink'}`}>{row.nv}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="grid grid-cols-2 border-t border-rule">
        <div className="px-5 py-4 bg-br-green/5 border-r border-rule">
          <p className="font-mono text-xs text-br-green uppercase tracking-widest mb-1">Choose Oct if…</p>
          <p className="text-xs font-sans text-secondary">{trades[0].why}</p>
        </div>
        <div className="px-5 py-4 bg-br-blue/5">
          <p className="font-mono text-xs text-br-blue uppercase tracking-widest mb-1">Choose Nov if…</p>
          <p className="text-xs font-sans text-secondary">{trades[1].why}</p>
        </div>
      </div>
    </div>
  )
}

// ─── PAYOFF CHART ─────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-rule rounded-lg px-3 py-2 shadow-lg">
      <p className="font-mono text-xs text-tertiary mb-1">EWZ @ ${Number(label).toFixed(2)}</p>
      {payload.map((e: any) => (
        <p key={e.name} className="font-mono text-sm font-medium" style={{ color: e.color }}>
          {e.name}: <span className={e.value >= 0 ? 'text-profit' : 'text-loss'}>{e.value >= 0 ? '+' : ''}${e.value}</span>
        </p>
      ))}
    </div>
  )
}

function PayoffChart() {
  const { data } = useMarket()
  const [oct, nov] = trades
  const octS    = data?.straddles.find(s => s.tradeId === oct.id)
  const novS    = data?.straddles.find(s => s.tradeId === nov.id)
  const octPrem = octS?.totalMid ?? octS?.totalLast ?? oct.totalPremium
  const novPrem = novS?.totalMid ?? novS?.totalLast ?? nov.totalPremium
  const spot    = data?.spot?.price ?? SPOT_PRICE
  const isLive  = data?.source === 'live'

  const octBEL = oct.strike - octPrem, octBEH = oct.strike + octPrem
  const novBEL = nov.strike - novPrem, novBEH = nov.strike + novPrem

  const octData = generatePayoffData(oct, octPrem)
  const novData = generatePayoffData(nov, novPrem)
  const merged  = octData.map((d, i) => ({ spot: d.spot, 'Oct 16': d.pnl, 'Nov 20': novData[i]?.pnl ?? 0 }))

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Oct 16 Breakevens', low: octBEL, high: octBEH, color: '#009C3B' },
          { label: 'Nov 20 Breakevens', low: novBEL, high: novBEH, color: '#002776' },
        ].map(item => (
          <div key={item.label} className="card px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="label">{item.label}</p>
              {isLive && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" /><span className="font-mono text-xs text-profit">Live</span></span>}
            </div>
            <p className="font-mono text-lg font-semibold" style={{ color: item.color }}>
              ${item.low.toFixed(2)} <span className="text-tertiary text-sm">↔</span> ${item.high.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={merged} margin={{ top: 16, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" />
            <XAxis dataKey="spot" tickFormatter={v => `$${Number(v).toFixed(0)}`} tick={{ fontSize: 11, fontFamily: 'DM Mono', fill: '#999994' }} tickLine={false} axisLine={{ stroke: '#E8E8E4' }} />
            <YAxis tickFormatter={v => `$${v}`} tick={{ fontSize: 11, fontFamily: 'DM Mono', fill: '#999994' }} tickLine={false} axisLine={false} width={65} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'DM Mono', color: '#999994', paddingTop: 12 }} />
            <ReferenceLine y={0} stroke="#0C0C0A" strokeWidth={1.5} strokeDasharray="5 4" />
            <ReferenceLine x={parseFloat(spot.toFixed(2))} stroke="#999994" strokeWidth={1.5}
              label={{ value: `$${spot.toFixed(2)}`, position: 'insideTopRight', fontSize: 10, fontFamily: 'DM Mono', fill: '#999994', dy: -4 }} />
            {[octBEL, octBEH].map(x => <ReferenceLine key={x} x={parseFloat(x.toFixed(2))} stroke="#009C3B" strokeWidth={1} strokeDasharray="3 5" opacity={0.7} />)}
            {[novBEL, novBEH].map(x => <ReferenceLine key={x} x={parseFloat(x.toFixed(2))} stroke="#002776" strokeWidth={1} strokeDasharray="3 5" opacity={0.5} />)}
            <Line type="monotone" dataKey="Oct 16" stroke="#009C3B" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#009C3B' }} />
            <Line type="monotone" dataKey="Nov 20" stroke="#002776" strokeWidth={2.5} dot={false} strokeDasharray="7 3" activeDot={{ r: 4, fill: '#002776' }} />
          </LineChart>
        </ResponsiveContainer>
        <p className="font-mono text-xs text-tertiary mt-3 text-center">
          Dashed verticals = breakeven levels · Dashed horizontal = zero P&L · Spot ${spot.toFixed(2)} marked
          {!isLive && ' · Using mock premiums'}
        </p>
      </div>
    </div>
  )
}

// ─── POSITION TRACKER ─────────────────────────────────────────────────────
function TrackerPanel({ tradeIndex, invested }: { tradeIndex: number; invested: number }) {
  const trade   = trades[tradeIndex]
  const isGreen = trade.color === 'green'
  const accent  = isGreen ? 'text-br-green' : 'text-br-blue'
  const accentBg = isGreen ? 'bg-br-green/5 border-br-green/20' : 'bg-br-blue/5 border-br-blue/20'

  const { data } = useMarket()
  const s    = data?.straddles.find(x => x.tradeId === trade.id)
  const spot = data?.spot?.price ?? SPOT_PRICE
  const d    = dte(trade.expiryDate)

  const m = useMemo(() => {
    if (invested <= 0) return null
    const curPrem  = s?.totalMid ?? s?.totalLast ?? trade.totalPremium
    const entPrem  = trade.totalPremium
    const contracts  = invested / (entPrem * 100)
    const costBasis  = invested
    const curValue   = contracts * curPrem * 100
    const unrealized = curValue - costBasis
    const pnlPct     = (unrealized / costBasis) * 100
    const beLow      = trade.strike - curPrem
    const beHigh     = trade.strike + curPrem
    const distLow    = ((spot - beLow)  / spot) * 100
    const distHigh   = ((beHigh - spot) / spot) * 100
    const premDelta  = curPrem - entPrem
    return { contracts, costBasis, curValue, unrealized, pnlPct, beLow, beHigh, distLow, distHigh, curPrem, entPrem, premDelta, ivCall: s?.call.iv ?? null, ivPut: s?.put.iv ?? null }
  }, [invested, s, spot, trade])

  if (invested <= 0) {
    return (
      <div className={`card border ${accentBg} p-5`}>
        <p className="label mb-2">{trade.badge}</p>
        <p className="heading-md text-lg text-ink mb-1">{trade.title}</p>
        <p className="text-sm text-tertiary font-sans mt-3 italic">Enter a notional amount to track this position.</p>
      </div>
    )
  }
  if (!m) return null

  return (
    <div className={`card border overflow-hidden ${isGreen ? 'border-br-green/20' : 'border-br-blue/20'}`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b border-rule flex items-center justify-between ${isGreen?'bg-br-green/5':'bg-br-blue/5'}`}>
        <div className="flex items-center gap-2">
          <span className={`font-mono text-xs px-2 py-0.5 rounded ${isGreen?'bg-br-green text-white':'bg-br-blue text-white'}`}>{trade.badge}</span>
          <span className="label">{trade.expiry}</span>
        </div>
        <div className={`flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full border ${dteBorder(d)} ${dteColor(d)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${d<=7?'bg-red-400':d<=21?'bg-amber-400':'bg-br-green'}`} />
          {d}d to expiry
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* P&L hero */}
        <div className={`rounded-xl px-4 py-4 ${pnlBg(m.unrealized)}`}>
          <p className="label mb-2">Unrealized P&L</p>
          <div className="flex items-baseline justify-between">
            <div>
              <span className={`font-mono text-3xl font-medium ${pnlColor(m.unrealized)}`}>
                {m.unrealized >= 0 ? '+' : ''}${Math.abs(m.unrealized).toFixed(0)}
              </span>
              <span className={`font-mono text-base ml-2 ${pnlColor(m.unrealized)}`}>
                ({m.pnlPct >= 0 ? '+' : ''}{m.pnlPct.toFixed(1)}%)
              </span>
            </div>
            <div className="text-right">
              <p className="label mb-0.5">Size</p>
              <p className="font-mono text-sm text-ink">{m.contracts.toFixed(2)} contracts</p>
              <p className="font-mono text-xs text-tertiary">${m.costBasis.toFixed(0)} invested</p>
            </div>
          </div>
        </div>

        {/* Premium */}
        <div>
          <p className="label mb-3">Premium (straddle total)</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: 'Entry', v: `$${m.entPrem.toFixed(2)}`, sub: 'per share', color: 'text-secondary' },
              { l: 'Current', v: `$${m.curPrem.toFixed(2)}`, sub: 'mid price', color: accent },
              { l: 'Change', v: `${m.premDelta >= 0?'+':''}${m.premDelta.toFixed(2)}`, sub: `${((m.premDelta/m.entPrem)*100).toFixed(1)}%`, color: pnlColor(m.premDelta) },
            ].map(({l,v,sub,color}) => (
              <div key={l} className="bg-canvas rounded-lg px-3 py-2.5">
                <p className="label mb-1">{l}</p>
                <p className={`font-mono text-sm font-medium ${color}`}>{v}</p>
                <p className="font-mono text-xs text-tertiary">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Breakeven distance */}
        <div>
          <p className="label mb-3">Breakeven distance from spot (${spot.toFixed(2)})</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Lower BE', be: m.beLow, dist: m.distLow, dir: 'must fall' },
              { label: 'Upper BE', be: m.beHigh, dist: m.distHigh, dir: 'must rise' },
            ].map(({ label, be, dist, dir }) => (
              <div key={label} className={`rounded-xl px-4 py-3 border ${dist < 5 ? 'border-red-200 bg-red-50' : 'border-rule bg-canvas'}`}>
                <p className="label mb-1">{label}</p>
                <p className={`font-mono text-base font-medium ${accent}`}>${be.toFixed(2)}</p>
                <p className={`font-mono text-xs mt-1.5 ${dist < 5 ? 'text-loss' : dist < 10 ? 'text-amber-500' : 'text-secondary'}`}>
                  {dist.toFixed(1)}% away
                </p>
                <p className="font-mono text-xs text-tertiary">Spot {dir} {dist.toFixed(1)}% to hit</p>
              </div>
            ))}
          </div>
        </div>

        {/* IV */}
        {(m.ivCall != null || m.ivPut != null) && (
          <div>
            <p className="label mb-3">Implied volatility (live)</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-canvas rounded-lg px-3 py-2.5"><p className="label mb-1">Call IV</p><p className={`font-mono text-sm font-medium ${accent}`}>{fmtIV(m.ivCall)}</p></div>
              <div className="bg-canvas rounded-lg px-3 py-2.5"><p className="label mb-1">Put IV</p><p className={`font-mono text-sm font-medium ${accent}`}>{fmtIV(m.ivPut)}</p></div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="flex flex-wrap gap-6 pt-3 border-t border-rule">
          <div><p className="label mb-1">Cost basis</p><p className="font-mono text-sm font-medium text-ink">${m.costBasis.toFixed(2)}</p></div>
          <div><p className="label mb-1">Current value</p><p className={`font-mono text-sm font-medium ${pnlColor(m.curValue - m.costBasis)}`}>${m.curValue.toFixed(2)}</p></div>
          <div><p className="label mb-1">Max loss</p><p className="font-mono text-sm font-medium text-loss">-${m.costBasis.toFixed(2)}</p></div>
        </div>
      </div>
    </div>
  )
}

function PositionTracker() {
  const [octAmt, setOctAmt] = useState('')
  const [novAmt, setNovAmt] = useState('')
  const { data }  = useMarket()
  const isLive    = data?.source === 'live'
  const octVal    = parseFloat(octAmt) || 0
  const novVal    = parseFloat(novAmt) || 0
  const total     = octVal + novVal

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="label mb-1">Position tracker</p>
          <h2 className="heading-lg text-2xl text-ink">Track Your P&L</h2>
          <p className="text-secondary text-sm font-sans mt-1 max-w-lg">Enter your $ invested per window. Unrealized P&L, breakeven distances, and DTE update automatically.</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-mono text-xs ${isLive?'bg-green-50 border-green-200 text-profit':'bg-canvas border-rule text-tertiary'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isLive?'bg-profit animate-pulse':'bg-rule'}`} />
          {isLive ? 'Using live mid' : 'Using mock data'}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {trades.map((t, i) => {
          const val = i === 0 ? octAmt : novAmt
          const set = i === 0 ? setOctAmt : setNovAmt
          const color = t.color === 'green' ? 'br-green' : 'br-blue'
          return (
            <div key={t.id} className={`card border border-${color}/20 p-5`}>
              <p className="label mb-1">{t.badge}</p>
              <p className="heading-md text-sm text-ink mb-3">{t.title} · {t.expiry}</p>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-tertiary pointer-events-none">$</span>
                <input
                  type="number" inputMode="decimal" min={0}
                  value={val} onChange={e => set(e.target.value)}
                  placeholder={`e.g. ${t.costPerContract}`}
                  className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-rule bg-canvas font-mono text-sm text-ink placeholder:text-tertiary focus:outline-none focus:ring-1 focus:ring-offset-0 focus:border-rule transition-colors"
                />
              </div>
              {parseFloat(val) > 0 && (
                <p className="font-mono text-xs text-tertiary mt-2">
                  ≈ {(parseFloat(val) / (t.totalPremium * 100)).toFixed(2)} contracts · 1 contract = ${t.costPerContract}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary bar */}
      {total > 0 && (
        <div className="card border border-rule px-5 py-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div><p className="label mb-1">Total invested</p><p className="font-mono text-xl font-medium text-ink">${total.toFixed(2)}</p></div>
            {octVal > 0 && novVal > 0 && <>
              <div className="w-px h-8 bg-rule" />
              <div><p className="label mb-1">Oct 16 allocation</p><p className="font-mono text-sm font-medium text-br-green">${octVal.toFixed(0)} ({((octVal/total)*100).toFixed(0)}%)</p></div>
              <div><p className="label mb-1">Nov 20 allocation</p><p className="font-mono text-sm font-medium text-br-blue">${novVal.toFixed(0)} ({((novVal/total)*100).toFixed(0)}%)</p></div>
            </>}
          </div>
          <button onClick={() => { setOctAmt(''); setNovAmt('') }} className="font-mono text-xs text-tertiary hover:text-loss transition-colors border border-rule rounded px-3 py-1.5">Clear</button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <TrackerPanel tradeIndex={0} invested={octVal} />
        <TrackerPanel tradeIndex={1} invested={novVal} />
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────
export default function EWZPage() {
  return (
    <main className="bg-canvas min-h-screen">
      <Nav />

      {/* ── PART 1: THESIS ── */}
      <section id="thesis" className="pt-20 pb-16 px-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mt-8 mb-10">
          <Link href="/" className="label hover:text-secondary transition-colors">SIGNALS</Link>
          <span className="label">/</span>
          <span className="label text-ink">EWZ Brazil 2026</span>
          <span className="lime-chip ml-2">ACTIVE</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start mb-12">
          <div className="lg:col-span-7">
            <p className="label mb-4">Long Volatility · Straddle</p>
            <h1 className="heading-xl text-4xl md:text-5xl lg:text-6xl text-ink mb-6">
              EWZ<br />
              <span className="text-secondary font-syne font-normal">Brazil Elections</span><br />
              <span style={{ color: '#C8F53C' }}>2026</span>
            </h1>
            <p className="text-secondary text-base leading-relaxed max-w-lg font-sans font-light">
              Long implied volatility into Brazil's Oct 4 federal election. Two expiry windows —
              one capturing the first-round shock, another covering a potential Oct 25 runoff
              and post-election policy repricing.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="card p-6">
              <p className="label mb-4">20-second thesis</p>
              <blockquote className="font-sans text-base text-ink leading-relaxed italic font-light">
                "The market is charging ~19% (Oct) vs ~23% (Nov) move to break even. My edge
                must come from either a larger realized move than implied, or monetizing an
                IV ramp before expiry."
              </blockquote>
              <div className="mt-5 pt-4 border-t border-rule flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-lime mt-1.5 flex-shrink-0" />
                <span className="font-mono text-xs text-tertiary">Both legs: buy call + buy put ATM · max loss = premium paid</span>
              </div>
            </div>
          </div>
        </div>

        {/* Why vol — 3 cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-14">
          {[
            { n:'01', title:'Tight Runoff Expected', body:'Recent polls show a closely contested race. Headline risk can reprice EWZ sharply in either direction.' },
            { n:'02', title:'Binary Event Risk',      body:'Brazil elections carry real policy discontinuity risk — fiscal policy, central bank independence, and trade stance all hinge on outcome.' },
            { n:'03', title:'IV Ramp Opportunity',    body:'Even before expiry, a ramp in implied volatility pre-election can be monetized by selling the straddle back at higher premium.' },
          ].map(c => (
            <div key={c.n} className="card p-5 hover:border-lime transition-colors">
              <span className="font-mono text-xs text-lime-dark mb-3 block">{c.n}</span>
              <h3 className="heading-md text-sm text-ink mb-2">{c.title}</h3>
              <p className="text-sm font-sans text-secondary leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <Timeline />
      </section>

      {/* ── DIVIDER ── */}
      <div className="relative py-10">
        <hr className="border-t border-rule" />
        <div className="max-w-6xl mx-auto px-6">
          <div id="trades" className="inline-flex items-center gap-3 bg-ink text-canvas px-5 py-2.5 rounded-full relative -top-5 left-1/2 -translate-x-1/2">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            <span className="font-mono text-xs tracking-wider">LIVE PRICES & DATA</span>
          </div>
        </div>
      </div>

      {/* ── PART 2: LIVE DATA ── */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="label mb-3">EWZ market data · ~15min delay</p>
          <SpotCard />
        </div>

        <p className="label mb-5">Trade structures</p>
        <div className="grid md:grid-cols-2 gap-5 mb-16">
          {trades.map((t, i) => <TradeCard key={t.id} trade={t} index={i} />)}
        </div>

        <p className="label mb-5">Side-by-side comparison</p>
        <div className="mb-16">
          <ComparisonTable />
        </div>

        <div id="payoff">
          <p className="label mb-5">Payoff diagram · at expiry</p>
          <PayoffChart />
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="relative py-10">
        <hr className="border-t border-rule" />
        <div className="max-w-6xl mx-auto px-6">
          <div id="tracker" className="inline-flex items-center gap-3 bg-canvas border border-rule px-5 py-2.5 rounded-full relative -top-5 left-1/2 -translate-x-1/2 shadow-sm">
            <span className="font-mono text-xs text-tertiary tracking-wider">P&L TRACKER</span>
          </div>
        </div>
      </div>

      {/* ── PART 3: TRACKER ── */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <PositionTracker />
      </section>

      {/* ── RISKS ── */}
      <section className="border-t border-rule px-6 py-16 max-w-6xl mx-auto">
        <p className="label mb-6">Risk management</p>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="font-mono text-xs text-loss uppercase tracking-widest mb-5">Key risks</p>
            <div className="space-y-3">
              {[
                { title: 'Theta Bleed', body: 'You pay time decay every day. Every calendar day erodes premium even if EWZ stays flat.' },
                { title: 'Post-Event Vol Crush', body: 'If Oct 4 outcome is clean, IV can drop sharply next day — hurting both legs even if EWZ moves.' },
                { title: 'Move Hurdle Is Not Small', body: '±19–23% is a large required move. You need a genuine political shock to profit at expiry.' },
              ].map(r => (
                <div key={r.title} className="card p-4">
                  <p className="heading-md text-sm text-ink mb-1">{r.title}</p>
                  <p className="text-xs font-sans text-secondary leading-relaxed">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-xs text-br-green uppercase tracking-widest mb-5">Monetization plan</p>
            <div className="space-y-3 mb-6">
              {[
                { title: 'Plan A — IV Ramp (Most Common)', body: 'Sell into the implied volatility ramp pre-election or during election week, before expiry.' },
                { title: 'Plan B — Realized Move', body: 'If chaos erupts and the realized move accelerates with rising runoff risk, hold through expiry.' },
              ].map(p => (
                <div key={p.title} className="card p-4 border-br-green/20">
                  <p className="heading-md text-sm text-ink mb-1">{p.title}</p>
                  <p className="text-xs font-sans text-secondary leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
            <div className="card p-4 bg-canvas">
              <p className="font-mono text-xs text-ink uppercase tracking-wider mb-2">⚡ Execution note</p>
              <p className="text-sm font-sans text-secondary leading-relaxed">
                Enter as one <strong className="text-ink font-semibold">multi-leg order</strong> — "buy straddle".
                Target <strong className="text-ink font-semibold">mid</strong>, not last.
                Getting legged adds 10–30bps of unnecessary slippage.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-rule px-6 py-8 max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-syne font-bold text-sm text-ink">← SIGNALS</Link>
        <p className="font-mono text-xs text-tertiary">Not financial advice · Market data ~15min delayed · Informational use only</p>
      </footer>
    </main>
  )
}
