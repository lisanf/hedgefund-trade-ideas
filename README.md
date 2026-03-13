# Trade Ideas — Long Volatility

A clean, minimal pitch site for structured options trade ideas. Built with Next.js 14, Tailwind CSS, and Recharts. Deployed on Vercel.

---

## Current Trade: EWZ Brazil Elections 2026

**Strategy:** Long Straddle — two expiry windows  
**Ticker:** EWZ (iShares MSCI Brazil ETF)  
**Catalyst:** Brazil Federal Elections — 1st Round Oct 4, 2026 / Runoff Oct 25, 2026

| | Oct 16 (Election-only) | Nov 20 (Election + Runoff) |
|---|---|---|
| Strike | $37 | $37 |
| Total Premium | $7.25 | $8.63 |
| Move Hurdle | ~19.3% | ~23.0% |
| Breakevens | $29.75 / $44.25 | $28.37 / $45.63 |

---

## Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **Market Data:** Yahoo Finance (unofficial, free, ~15min delay)
- **Deployment:** [Vercel](https://vercel.com/)
- **Fonts:** Playfair Display + IBM Plex Sans + IBM Plex Mono

---

## Market Data Architecture

```
Yahoo Finance (free, no API key, ~15min delay)
  └─ /api/market  (Next.js server route, 5min cache)
       ├─ v8/finance/chart/EWZ          → spot price + daily change
       └─ v7/finance/options/EWZ?date=  → options chain (bid/ask/last/IV)
            ├─ Oct 16 2026 expiry
            └─ Nov 20 2026 expiry
```

The client polls `/api/market` every 60 seconds. If Yahoo returns an error or blocks the request, the UI falls back to mock data gracefully — no crashes, no empty states.

**Data shown per leg:** `last`, `bid`, `ask`, `mid` (calculated), `IV`, volume, open interest  
**Straddle totals:** `totalBid`, `totalAsk`, `totalMid`, `totalLast`  
**Move hurdle and breakevens** recalculate live from the current mid price.

---

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
# → http://localhost:3000

# Build for production
npm run build
```

No environment variables required for the base setup — Yahoo Finance endpoints are public.

---

## Deploy to Vercel

```bash
# Push to GitHub, then either:
# 1. Import repo at vercel.com/new (auto-detects Next.js)
# 2. Or use the CLI:
npx vercel
```

Vercel's server IPs generally get better results from Yahoo Finance than localhost.

---

## Project Structure

```
trade-ideas/
├── app/
│   ├── api/market/route.ts   ← Yahoo Finance server fetcher
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── MarketDataProvider.tsx ← React context (wraps app)
│   ├── SpotBadge.tsx          ← Live EWZ spot + change %
│   ├── Nav.tsx
│   ├── Hero.tsx
│   ├── Timeline.tsx
│   ├── TradeCard.tsx          ← Live bid/ask/mid per leg
│   ├── OptionLegRow.tsx
│   ├── ComparisonTable.tsx    ← Live mid + delta vs entry
│   ├── PayoffChart.tsx        ← Live breakevens + spot line
│   ├── RiskSection.tsx
│   └── Footer.tsx
├── hooks/
│   └── useMarketData.ts       ← 60s polling hook
└── lib/
    ├── trades.ts              ← Mock data + payoff generator
    └── market.ts              ← Types + formatters
```

---

## Roadmap

- [ ] Phase 3 — Add second trade idea (different ticker or structure)
- [ ] Phase 4 — P&L tracker: enter your position, track live value
- [ ] Phase 5 — Multi-trade dashboard with portfolio-level Greeks

---

## Disclaimer

This site uses market data for informational and educational purposes only. Nothing on this page constitutes financial advice. Always verify quotes independently before executing any trade.
