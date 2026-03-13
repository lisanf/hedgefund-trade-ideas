'use client'

import Link from 'next/link'
import { useMarket } from '@/components/MarketDataProvider'
import { changeColor } from '@/lib/market'

// ─── Minimal top nav ───────────────────────────────────────────────────────
function HomeNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 mix-blend-multiply">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="font-syne font-bold text-ink text-sm tracking-tight">SIGNALS</span>
        <nav className="flex items-center gap-6 text-xs font-mono text-secondary">
          <a href="#ideas" className="hover:text-ink transition-colors">Ideas</a>
          <span className="text-rule">·</span>
          <span className="text-tertiary italic">About — soon</span>
        </nav>
      </div>
    </header>
  )
}

// ─── Animated spot ticker ──────────────────────────────────────────────────
function LiveTicker() {
  const { data } = useMarket()
  const spot = data?.spot
  const isLive = data?.source === 'live'

  const items = [
    { label: 'EWZ', value: spot ? `$${spot.price.toFixed(2)}` : '—', change: spot?.changePct },
    { label: 'BRAZIL ELECTION', value: 'OCT 4 2026' },
    { label: 'STRATEGY', value: 'LONG VOL' },
    { label: 'STRUCTURE', value: 'STRADDLE' },
    { label: 'EWZ', value: spot ? `$${spot.price.toFixed(2)}` : '—', change: spot?.changePct },
    { label: 'BRAZIL ELECTION', value: 'OCT 4 2026' },
    { label: 'STRATEGY', value: 'LONG VOL' },
    { label: 'STRUCTURE', value: 'STRADDLE' },
  ]

  return (
    <div className="overflow-hidden border-y border-rule py-2.5 bg-canvas">
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-3 pr-10">
            <span className="font-mono text-[10px] text-tertiary tracking-widest">{item.label}</span>
            <span className={`font-mono text-[11px] font-medium ${
              item.change != null ? changeColor(item.change) : 'text-ink'
            }`}>
              {item.value}
              {item.change != null && (
                <span className="ml-1 text-[9px]">
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                </span>
              )}
            </span>
            <span className="text-rule text-xs">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Big hero ──────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 pt-24 pb-16 max-w-7xl mx-auto">

      {/* Decorative lime blob — art moment */}
      <div
        className="absolute top-32 right-8 md:right-24 w-48 h-48 md:w-72 md:h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #C8F53C 0%, #C8F53C44 55%, transparent 72%)',
          filter: 'blur(32px)',
          opacity: 0.55,
        }}
      />

      <div className="relative">
        {/* Pre-label */}
        <div className="flex items-center gap-3 mb-8 anim-up anim-up-1">
          <div className="w-6 h-px bg-lime-dark" />
          <span className="label text-secondary">Investment research</span>
        </div>

        {/* Main headline — typographic statement */}
        <h1 className="heading-xl text-5xl md:text-7xl lg:text-8xl text-ink mb-6 anim-up anim-up-2 max-w-5xl">
          Markets are just{' '}
          <span className="relative inline-block">
            <span className="relative z-10">narratives</span>
            <span
              className="absolute inset-x-0 bottom-1 h-3 md:h-4"
              style={{ background: '#C8F53C', zIndex: 0, borderRadius: '2px' }}
            />
          </span>{' '}
          with prices.
        </h1>

        {/* Sub-copy */}
        <p className="text-secondary text-base md:text-lg max-w-lg leading-relaxed mb-14 anim-up anim-up-3 font-sans font-light">
          A personal log of trade ideas — structured positions built around
          catalysts, volatility, and a point of view.
        </p>

        {/* CTA */}
        <div className="flex items-center gap-4 anim-up anim-up-4">
          <a
            href="#ideas"
            className="inline-flex items-center gap-2 bg-ink text-canvas font-syne font-semibold text-sm px-6 py-3 rounded-full hover:bg-secondary transition-colors"
          >
            See trade ideas
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <span className="text-xs font-mono text-tertiary">1 active idea</span>
        </div>
      </div>

      {/* Bottom row — subtle context */}
      <div className="absolute bottom-10 left-6 right-6 max-w-7xl flex items-end justify-between anim-up anim-up-5">
        <span className="label">© 2026</span>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
          <span className="label">Market data updating</span>
        </div>
      </div>
    </section>
  )
}

// ─── Trade ideas grid ──────────────────────────────────────────────────────
function TradeIdeaCard() {
  const { data } = useMarket()
  const spot = data?.spot

  return (
    <Link href="/trades/ewz-brazil-2026" className="group block">
      <article className="card overflow-hidden hover:border-lime transition-all duration-300 hover:shadow-lg hover:shadow-lime/10">
        {/* Top band */}
        <div className="bg-ink px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="lime-tag">NEW</span>
            <span className="font-mono text-xs text-canvas/50 tracking-widest">LONG VOL</span>
          </div>
          <span className="font-mono text-xs text-canvas/40">Oct 2026</span>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="label mb-1.5">iShares MSCI Brazil ETF</p>
              <h2 className="heading-lg text-2xl text-ink">
                EWZ Straddle
                <span className="block text-tertiary font-syne font-normal text-base mt-0.5">Brazil Elections 2026</span>
              </h2>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="label mb-1">EWZ Spot</p>
              {spot ? (
                <>
                  <p className="font-mono text-xl font-medium text-ink">${spot.price.toFixed(2)}</p>
                  <p className={`font-mono text-xs mt-0.5 ${changeColor(spot.change)}`}>
                    {spot.change >= 0 ? '+' : ''}{spot.change.toFixed(2)} ({spot.changePct >= 0 ? '+' : ''}{spot.changePct.toFixed(2)}%)
                  </p>
                </>
              ) : (
                <p className="font-mono text-xl font-medium text-tertiary">—</p>
              )}
            </div>
          </div>

          {/* One-liner thesis */}
          <p className="text-secondary text-sm font-sans leading-relaxed mb-5 border-l-2 border-lime pl-3">
            Long volatility into Brazil's Oct 4 election. Two straddle windows — choose Oct 16 for the pure shock, Nov 20 to cover a potential runoff.
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Structure', value: '37 Straddle' },
              { label: 'Oct Hurdle', value: '~19.3%' },
              { label: 'Nov Hurdle', value: '~23.0%' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-canvas rounded-lg px-3 py-2.5">
                <p className="label mb-1">{label}</p>
                <p className="font-mono text-sm font-medium text-ink">{value}</p>
              </div>
            ))}
          </div>

          {/* Expiry tags */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <span className="font-mono text-[10px] px-2 py-1 rounded bg-br-green/10 text-br-green border border-br-green/20">Oct 16</span>
              <span className="font-mono text-[10px] px-2 py-1 rounded bg-br-blue/10 text-br-blue border border-br-blue/20">Nov 20</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-mono text-secondary group-hover:text-ink transition-colors">
              Open idea
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="group-hover:translate-x-0.5 transition-transform">
                <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="bg-canvas relative overflow-x-hidden">
      <HomeNav />
      <Hero />
      <LiveTicker />

      <section id="ideas" className="px-6 py-20 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="label mb-2">Open positions</p>
            <h2 className="heading-lg text-3xl text-ink">Trade Ideas</h2>
          </div>
          <span className="font-mono text-xs text-tertiary border border-rule rounded-full px-3 py-1">
            1 of 1
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <TradeIdeaCard />

          {/* Coming soon placeholder */}
          <div className="card border-dashed flex flex-col items-center justify-center py-16 text-center opacity-40">
            <div className="w-8 h-8 rounded-full border border-rule flex items-center justify-center mb-3">
              <span className="text-tertiary text-lg leading-none">+</span>
            </div>
            <p className="label">Next idea</p>
            <p className="text-xs font-sans text-tertiary mt-1">Coming soon</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rule px-6 py-8 max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <span className="font-syne font-bold text-ink text-sm">SIGNALS</span>
        <p className="font-mono text-xs text-tertiary">
          Not financial advice · Market data ~15min delayed · For informational use only
        </p>
      </footer>
    </main>
  )
}
