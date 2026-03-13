'use client'

// components/SpotBadge.tsx
// Shows live EWZ spot price with change, last-fetched time, source indicator

import { useMarket } from './MarketDataProvider'
import { changeColor } from '@/lib/market'
import { RefreshCw } from 'lucide-react'

function formatTime(date: Date | null): string {
  if (!date) return '...'
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
}

export default function SpotBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const { data, loading, lastUpdated, refresh } = useMarket()
  const spot = data?.spot

  const sourceLabel = data?.source === 'live'
    ? { label: 'Live', dot: 'bg-profit', text: 'text-profit' }
    : data?.source === 'mock'
    ? { label: 'Mock', dot: 'bg-brazil-yellow', text: 'text-amber-600' }
    : { label: 'Error', dot: 'bg-loss', text: 'text-loss' }

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${sourceLabel.dot} ${data?.source === 'live' ? 'animate-pulse' : ''}`} />
        <span className="font-mono text-xs text-muted">
          EWZ{' '}
          <span className="text-ink font-semibold">
            {loading ? '...' : `$${spot?.price.toFixed(2)}`}
          </span>
          {spot && (
            <span className={`ml-1 ${changeColor(spot.change)}`}>
              {spot.change >= 0 ? '+' : ''}{spot.change.toFixed(2)} ({spot.changePct >= 0 ? '+' : ''}{spot.changePct.toFixed(2)}%)
            </span>
          )}
        </span>
        <span className="text-muted/60 text-xs font-mono">
          {lastUpdated ? formatTime(lastUpdated) : ''}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Price */}
      <div>
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">EWZ Spot</p>
        <div className="flex items-baseline gap-2">
          {loading ? (
            <span className="font-mono text-3xl font-semibold text-ink/30 animate-pulse">$—.——</span>
          ) : (
            <>
              <span className="font-mono text-3xl font-semibold text-ink">
                ${spot?.price.toFixed(2) ?? '—'}
              </span>
              {spot && (
                <span className={`font-mono text-sm font-medium ${changeColor(spot.change)}`}>
                  {spot.change >= 0 ? '+' : ''}{spot.change.toFixed(2)}{' '}
                  ({spot.changePct >= 0 ? '+' : ''}{spot.changePct.toFixed(2)}%)
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Source + timestamp */}
      <div className="ml-auto flex flex-col items-end gap-1">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sourceLabel.dot} ${data?.source === 'live' ? 'animate-pulse' : ''}`} />
          <span className={`text-xs font-mono font-medium ${sourceLabel.text}`}>{sourceLabel.label}</span>
          <span className="text-xs font-mono text-muted/50">· ~15min delay</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted/60">
          <span>Last: {lastUpdated ? formatTime(lastUpdated) : '—'}</span>
          <button
            onClick={refresh}
            className="hover:text-muted transition-colors"
            title="Refresh market data"
          >
            <RefreshCw size={11} />
          </button>
        </div>
      </div>
    </div>
  )
}
