'use client'

import SpotBadge from './SpotBadge'

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-paper/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-display font-semibold text-ink text-lg tracking-tight">
            Trade Ideas
          </span>
          <span className="text-muted text-xs font-body font-medium tracking-widest uppercase hidden sm:inline">
            Long Vol
          </span>
        </div>

        {/* Live spot — center / middle */}
        <div className="flex-1 flex justify-center">
          <SpotBadge size="sm" />
        </div>

        {/* Links */}
        <div className="flex items-center gap-5 text-sm font-body text-muted flex-shrink-0">
          <a href="#thesis" className="hover:text-ink transition-colors hidden md:inline">Thesis</a>
          <a href="#trades" className="hover:text-ink transition-colors hidden md:inline">Trades</a>
          <a href="#payoff" className="hover:text-ink transition-colors hidden md:inline">Payoff</a>
          <a href="#risks" className="hover:text-ink transition-colors hidden md:inline">Risks</a>
        </div>
      </div>
    </nav>
  )
}
