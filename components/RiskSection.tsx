'use client'

import { keyRisks, monetizationPlan } from '@/lib/trades'

const iconMap: Record<string, string> = {
  clock: '⏱',
  'trending-down': '📉',
  'alert-triangle': '⚠️',
}

export default function RiskSection() {
  return (
    <section id="risks" className="py-20 px-6 bg-white border-t border-border">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Risk Management</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-12">Key Risks & Execution</h2>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Risks */}
          <div>
            <p className="text-xs font-mono text-loss uppercase tracking-widest mb-6">Risks to say out loud</p>
            <div className="space-y-4">
              {keyRisks.map((risk) => (
                <div key={risk.title} className="flex gap-4 p-4 rounded-xl border border-border hover:border-loss/20 transition-colors bg-paper">
                  <span className="text-xl flex-shrink-0">{iconMap[risk.icon]}</span>
                  <div>
                    <h3 className="text-sm font-body font-semibold text-ink mb-1">{risk.title}</h3>
                    <p className="text-xs font-body text-muted leading-relaxed">{risk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monetization + Execution */}
          <div className="space-y-8">
            <div>
              <p className="text-xs font-mono text-brazil-green uppercase tracking-widest mb-6">Monetization plan</p>
              <div className="space-y-3">
                {monetizationPlan.map((item) => (
                  <div key={item.plan} className="p-4 rounded-xl border border-brazil-green/20 bg-brazil-green/5">
                    <p className="text-sm font-body font-semibold text-ink mb-1">{item.plan}</p>
                    <p className="text-xs font-body text-muted leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-mono text-muted uppercase tracking-widest mb-4">Execution note</p>
              <div className="p-4 rounded-xl border border-border bg-paper">
                <p className="text-xs font-mono text-ink uppercase tracking-wider font-medium mb-2">⚡ Don't get legged</p>
                <p className="text-sm font-body text-muted leading-relaxed">
                  Enter as <strong className="text-ink font-semibold">one multi-leg order</strong> — "buy straddle". Target <strong className="text-ink font-semibold">mid</strong>, not last. Getting legged on the two separate legs can add 10–30bps of unnecessary slippage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
