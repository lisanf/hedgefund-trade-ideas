'use client'

import Link from 'next/link'
import { useMarket } from '@/components/MarketProvider'
import { changeColor } from '@/lib/market'

export default function HomePage() {
  const { data } = useMarket()
  const spot = data?.spot
  const isLive = data?.source === 'live'

  return (
    <main className="min-h-screen bg-canvas">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-canvas/90 backdrop-blur-md border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <span className="font-syne font-bold text-sm tracking-tight text-ink">SIGNALS</span>
          <div className="flex items-center gap-3">
            {spot && (
              <span className="font-mono text-xs text-secondary">
                EWZ <span className="text-ink font-medium">${spot.price.toFixed(2)}</span>
                <span className={`ml-1.5 ${changeColor(spot.changePct)}`}>
                  {spot.changePct >= 0 ? '+' : ''}{spot.changePct.toFixed(2)}%
                </span>
              </span>
            )}
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="mb-10 anim-up anim-delay-1">
          <div className="flex items-center gap-3">
            <div className="w-6 h-px bg-lime-dark" />
            <span className="label">Investment research</span>
          </div>
        </div>

        <h1 className="heading-xl text-5xl md:text-7xl text-ink mb-6 anim-up anim-delay-2 max-w-3xl">
          Markets are just{' '}
          <span className="relative inline-block">
            <span className="relative z-10">narratives</span>
            <span className="absolute inset-x-0 bottom-1 h-3 md:h-4 bg-lime z-0 rounded-sm" />
          </span>{' '}
          with prices.
        </h1>

        <p className="text-secondary text-lg max-w-lg leading-relaxed mb-14 anim-up anim-delay-3 font-sans font-light">
          A curated log of trade ideas — structured positions built around catalysts,
          volatility, and a point of view.
        </p>

        {/* Active trade card */}
        <div className="anim-up anim-delay-4 max-w-2xl">
          <p className="label mb-4">Active ideas</p>
          <Link href="/trades/ewz-brazil-2026" className="group block">
            <article className="card overflow-hidden hover:border-lime transition-all duration-300">
              {/* Top band */}
              <div className="bg-ink px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="lime-chip">ACTIVE</span>
                  <span className="font-mono text-xs text-white/40 tracking-widest">LONG VOL</span>
                </div>
                <span className="font-mono text-xs text-white/40">Oct 2026</span>
              </div>

              <div className="px-6 py-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="label mb-1.5">iShares MSCI Brazil ETF</p>
                    <h2 className="heading-lg text-2xl text-ink">
                      🇧🇷 EWZ Straddle
                      <span className="block text-tertiary font-syne font-normal text-base mt-0.5">
                        Brazil Elections 2026
                      </span>
                    </h2>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="label mb-1">EWZ Spot</p>
                    {spot ? (
                      <>
                        <p className="font-mono text-xl font-medium text-ink">${spot.price.toFixed(2)}</p>
                        <p className={`font-mono text-xs mt-0.5 ${changeColor(spot.changePct)}`}>
                          {spot.changePct >= 0 ? '+' : ''}{spot.changePct.toFixed(2)}%
                        </p>
                      </>
                    ) : (
                      <p className="font-mono text-xl text-tertiary animate-pulse">——</p>
                    )}
                  </div>
                </div>

                <p className="text-secondary text-sm font-sans leading-relaxed mb-5 border-l-2 border-lime pl-3">
                  Long volatility into Brazil's Oct 4 federal election. Two straddle windows —
                  Oct 16 for the pure first-round shock, Nov 20 to cover a potential runoff.
                </p>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { l: 'Structure', v: '37 Straddle' },
                    { l: 'Oct hurdle', v: '~19.3%' },
                    { l: 'Nov hurdle', v: '~23.0%' },
                  ].map(({ l, v }) => (
                    <div key={l} className="bg-canvas rounded-lg px-3 py-2.5">
                      <p className="label mb-1">{l}</p>
                      <p className="font-mono text-sm font-medium text-ink">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="font-mono text-xs px-2 py-1 rounded bg-br-green/10 text-br-green border border-br-green/20">Oct 16</span>
                    <span className="font-mono text-xs px-2 py-1 rounded bg-br-blue/10 text-br-blue border border-br-blue/20">Nov 20</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-mono text-secondary group-hover:text-ink transition-colors">
                    Open full analysis
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="group-hover:translate-x-0.5 transition-transform">
                      <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </div>
            </article>
          </Link>
        </div>
      </section>

      <footer className="border-t border-rule px-6 py-8 max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <span className="font-syne font-bold text-sm text-ink">SIGNALS</span>
        <p className="font-mono text-xs text-tertiary">Not financial advice · ~15min delayed data</p>
      </footer>
    </main>
  )
}
