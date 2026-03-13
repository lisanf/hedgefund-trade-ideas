'use client'

import { electionDates } from '@/lib/trades'

const typeStyles = {
  range: { dot: 'bg-muted', label: 'text-muted', line: 'border-dashed' },
  event: { dot: 'bg-brazil-green', label: 'text-ink', line: 'border-solid' },
  expiry: { dot: 'bg-brazil-blue', label: 'text-ink', line: 'border-solid' },
}

const typeLabels = {
  range: 'Period',
  event: 'Election',
  expiry: 'Expiry',
}

export default function Timeline() {
  return (
    <section id="thesis" className="py-16 px-6 bg-white border-y border-border">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-8">Election Calendar & Trade Windows</p>

        {/* Desktop timeline */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-4 left-0 right-0 h-px bg-border" />

            <div className="grid grid-cols-5 gap-2">
              {electionDates.map((item, i) => {
                const styles = typeStyles[item.type]
                return (
                  <div key={i} className="relative flex flex-col items-center">
                    {/* Dot */}
                    <div className={`relative z-10 w-3 h-3 rounded-full border-2 border-paper ${styles.dot} mb-4`} />
                    {/* Badge */}
                    <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded mb-2 ${
                      item.type === 'expiry'
                        ? 'bg-brazil-blue/10 text-brazil-blue'
                        : item.type === 'event'
                          ? 'bg-brazil-green/10 text-brazil-green'
                          : 'bg-border text-muted'
                    }`}>
                      {typeLabels[item.type]}
                    </span>
                    <p className="text-xs text-center font-body font-medium text-ink">{item.label}</p>
                    <p className="text-xs text-center font-mono text-muted mt-0.5">{item.date}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Mobile timeline */}
        <div className="md:hidden space-y-4">
          {electionDates.map((item, i) => {
            const styles = typeStyles[item.type]
            return (
              <div key={i} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${styles.dot}`} />
                  {i < electionDates.length - 1 && <div className="w-px h-8 bg-border mt-1" />}
                </div>
                <div className="pb-2">
                  <span className="text-xs font-mono text-muted">{item.date}</span>
                  <p className={`text-sm font-body font-medium ${styles.label}`}>{item.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-5 mt-8 pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brazil-green" />
            <span className="text-xs font-mono text-muted">Election event</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brazil-blue" />
            <span className="text-xs font-mono text-muted">Options expiry</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-muted" />
            <span className="text-xs font-mono text-muted">Build-up period</span>
          </div>
        </div>
      </div>
    </section>
  )
}
