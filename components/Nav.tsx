'use client'

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-paper/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display font-semibold text-ink text-lg tracking-tight">
            Trade Ideas
          </span>
          <span className="text-muted text-xs font-body font-medium tracking-widest uppercase">
            Long Vol
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm font-body text-muted">
          <a href="#thesis" className="hover:text-ink transition-colors">Thesis</a>
          <a href="#trades" className="hover:text-ink transition-colors">Trades</a>
          <a href="#payoff" className="hover:text-ink transition-colors">Payoff</a>
          <a href="#risks" className="hover:text-ink transition-colors">Risks</a>
          <span className="flex items-center gap-1.5 text-xs font-mono bg-brazil-green/10 text-brazil-green px-2.5 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-brazil-green animate-pulse inline-block" />
            Mock Data
          </span>
        </div>
      </div>
    </nav>
  )
}
