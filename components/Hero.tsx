'use client'

import SpotBadge from './SpotBadge'
import { useMarket } from './MarketDataProvider'

export default function Hero() {
  const { data } = useMarket()

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })

  return (
    <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
      {/* Top meta row */}
      <div className="flex flex-wrap items-center gap-3 mb-10 animate-fade-up animate-fade-up-delay-1">
        <span className="inline-flex items-center gap-2 bg-brazil-green text-white text-xs font-mono font-medium px-3 py-1.5 rounded-full tracking-wide">
          🇧🇷 EWZ
        </span>
        <span className="text-muted text-xs font-mono uppercase tracking-widest">
          iShares MSCI Brazil ETF · Oct 2026 Election
        </span>
        <span className="ml-auto text-muted text-xs font-mono">{today}</span>
      </div>

      {/* Headline */}
      <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-ink leading-[1.08] tracking-tight mb-6 animate-fade-up animate-fade-up-delay-2 max-w-4xl">
        Long Volatility
        <span className="block text-brazil-green italic font-normal">
          Brazil Elections 2026
        </span>
      </h1>

      <hr className="rule mb-8 animate-fade-up animate-fade-up-delay-2" />

      {/* Live Spot price block */}
      <div className="bg-white border border-border rounded-2xl px-6 py-5 mb-10 animate-fade-up animate-fade-up-delay-2">
        <SpotBadge size="md" />
      </div>

      {/* Thesis + Key context */}
      <div className="grid md:grid-cols-5 gap-10 mb-14">
        <div className="md:col-span-3 animate-fade-up animate-fade-up-delay-3">
          <p className="text-sm font-mono text-muted uppercase tracking-widest mb-3">20-Second Thesis</p>
          <blockquote className="font-display text-xl md:text-2xl text-ink leading-relaxed font-normal italic">
            "I'm long EWZ volatility around Brazil's Oct 4 election. The clean expression is a 37 straddle — comparing two windows: Oct 16 to capture first-round shock, and Nov 20 to include a potential runoff and post-election repricing."
          </blockquote>
          <p className="mt-4 font-body text-muted text-sm leading-relaxed max-w-xl">
            My edge must come from either a larger realized move than implied, or monetizing an IV ramp before expiry. The market is pricing ~19% (Oct) vs ~23% (Nov) to break even at expiry.
          </p>
        </div>

        <div className="md:col-span-2 animate-fade-up animate-fade-up-delay-4">
          <p className="text-sm font-mono text-muted uppercase tracking-widest mb-3">Key Context</p>
          <div className="space-y-0">
            {[
              { label: '1st Round', value: 'Oct 4, 2026', note: 'Brazil Federal Election' },
              { label: 'Runoff (if needed)', value: 'Oct 25, 2026', note: 'Tight race per latest polls' },
              { label: 'Strategy', value: 'Long Straddle', note: 'ATM · two expiry windows' },
              { label: 'Trade 1 Expiry', value: 'Oct 16, 2026', note: 'Election-only window' },
              { label: 'Trade 2 Expiry', value: 'Nov 20, 2026', note: 'Covers potential runoff' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-start justify-between py-2.5 border-b border-border last:border-0">
                <div>
                  <span className="text-xs text-muted font-body block">{stat.label}</span>
                  <span className="text-xs text-muted/70 font-body">{stat.note}</span>
                </div>
                <span className="stat-value text-sm text-ink font-medium text-right">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why vol strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-up animate-fade-up-delay-5">
        {[
          {
            number: '01',
            title: 'Tight Runoff Expected',
            body: 'Recent polls show a closely contested race — headline risk can reprice EWZ sharply in either direction.',
          },
          {
            number: '02',
            title: 'Binary Event Risk',
            body: 'Brazil elections carry real policy discontinuity risk. Market direction depends heavily on the winner\'s fiscal stance.',
          },
          {
            number: '03',
            title: 'Options Affordability',
            body: 'IV levels reflect uncertainty but a large enough realized move — or pre-election IV ramp — can monetize the position.',
          },
        ].map((item) => (
          <div key={item.number} className="bg-white border border-border rounded-xl p-5 hover:border-brazil-green/30 transition-colors">
            <span className="font-mono text-xs text-brazil-green/50 font-medium mb-2 block">{item.number}</span>
            <h3 className="font-display text-base font-semibold text-ink mb-1.5">{item.title}</h3>
            <p className="text-sm font-body text-muted leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
