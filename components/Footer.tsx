export default function Footer() {
  return (
    <footer className="py-10 px-6 border-t border-border bg-paper">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="font-display font-semibold text-ink text-sm">Trade Ideas — Long Vol</p>
          <p className="text-xs font-mono text-muted mt-0.5">EWZ · Brazil Federal Elections 2026</p>
        </div>
        <div className="text-xs font-body text-muted max-w-md leading-relaxed text-right">
          <span className="font-mono text-xs bg-border px-2 py-0.5 rounded text-muted mr-2">⚠ Mock Data</span>
          This page uses illustrative mock data for UI purposes only. Not financial advice. Always verify real-time quotes before executing.
        </div>
      </div>
    </footer>
  )
}
