import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Timeline from '@/components/Timeline'
import TradeCard from '@/components/TradeCard'
import ComparisonTable from '@/components/ComparisonTable'
import PayoffChart from '@/components/PayoffChart'
import RiskSection from '@/components/RiskSection'
import Footer from '@/components/Footer'
import { trades } from '@/lib/trades'

export default function Home() {
  return (
    <main className="min-h-screen bg-paper">
      <Nav />
      <Hero />
      <Timeline />

      {/* Trade Cards */}
      <section id="trades" className="py-20 px-6 max-w-6xl mx-auto">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Trade Structures</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-10">Two Windows, One Thesis</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {trades.map((trade, i) => (
            <TradeCard key={trade.id} trade={trade} index={i} />
          ))}
        </div>
      </section>

      <ComparisonTable />
      <PayoffChart />
      <RiskSection />
      <Footer />
    </main>
  )
}
