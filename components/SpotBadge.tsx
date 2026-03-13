'use client'

import { useMarket } from './MarketDataProvider'
import { changeColor } from '@/lib/market'
import { RefreshCw } from 'lucide-react'

function formatTime(date: Date | null): string {
  if (!date) return '—'
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

export function SpotBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const { data, loading, lastUpdated, refresh } = useMarket()
  const spot = data?.spot

  const isLive = data?.source === 'live'
  const sourceDot = isLive ? 'bg-profit animate-pulse' : 'bg-amber-400'
  const sourceLabel = isLive ? 'Live' : data?.source === 'mock' ? 'Mock' : 'Error'
  const sourceColor = isLive ? 'text-profit' : 'text-amber-500'

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${sourceDot}`} />
        <span className="font-mono text-xs text-secondary">
          EWZ{' '}
          <span className="text-ink font-medium">
            {loading ? '···' : `$${spot?.price.toFixed(2) ?? '—'}`}
          </span>
          {spot && (
            <span className={`ml-1.5 ${changeColor(spot.change)}`}>
              {spot.change >= 0 ? '+' : ''}{spot.change.toFixed(2)} ({spot.changePct >= 0 ? '+' : ''}{spot.changePct.toFixed(2)}%)
            </span>
          )}
        </span>
        {lastUpdated && <span className="font-mono text-[10px] text-tertiary">{formatTime(lastUpdated)}</span>}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-6">
      {/* Price */}
      <div>
        <p className="label mb-1.5">EWZ Spot</p>
        <div className="flex items-baseline gap-3">
          {loading ? (
            <span className="font-mono text-3xl font-medium text-tertiary animate-pulse">$—.——</span>
          ) : (
            <>
              <span className="font-mono text-3xl font-medium text-ink">${spot?.price.toFixed(2) ?? '—'}</span>
              {spot && (
                <span className={`font-mono text-sm ${changeColor(spot.change)}`}>
                  {spot.change >= 0 ? '+' : ''}{spot.change.toFixed(2)} ({spot.changePct >= 0 ? '+' : ''}{spot.changePct.toFixed(2)}%)
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Prev close */}
      {spot && (
        <div>
          <p className="label mb-1.5">Prev Close</p>
          <p className="font-mono text-base text-secondary">${spot.previousClose.toFixed(2)}</p>
        </div>
      )}

      {/* Source + refresh */}
      <div className="ml-auto text-right">
        <div className="flex items-center justify-end gap-2 mb-1">
          <span className={`w-1.5 h-1.5 rounded-full ${sourceDot}`} />
          <span className={`font-mono text-xs font-medium ${sourceColor}`}>{sourceLabel}</span>
          <span className="font-mono text-xs text-tertiary">· ~15min delay</span>
        </div>
        <div className="flex items-center justify-end gap-2 font-mono text-[10px] text-tertiary">
          <span>Updated {lastUpdated ? formatTime(lastUpdated) : '—'}</span>
          <button
            onClick={refresh}
            className="hover:text-secondary transition-colors p-0.5"
            title="Refresh"
          >
            <RefreshCw size={10} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Default export for backwards compat
export default SpotBadge
