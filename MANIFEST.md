# Header Redesign + Search + News Volume — Merge Instructions

Mirrors your project root. Copy `backend/` and `frontend/` into your project, overwrite when prompted, restart both dev servers.

## Files (1 NEW, 6 OVERWRITTEN)

**New:** `frontend/src/components/layout/GlobalSearch.tsx`

**Overwritten:**
```
backend/src/services/news.service.ts
backend/src/controllers/news.controller.ts
frontend/src/components/layout/AppLayout.tsx
frontend/src/components/home/BusinessPulseFeed.tsx
frontend/src/components/home/CurrencyWatchCard.tsx
frontend/src/pages/HomePage.tsx
```

No new npm packages, no schema changes.

---

## 1. Professional header, no emoji

Replaced "Good day, {name} 👋 / Here's what's happening..." with a compact "Welcome back, {name}" + your business name underneath, in the same display font used for the brand wordmark. It only shows on larger screens (`lg:` and up) now — on mobile, that space is better spent on the search bar (see below), and the greeting was redundant with the page content itself anyway. Same emoji removed from the Home page's own greeting for consistency.

## 2. Search bar in the header

New `GlobalSearch` component — a real input, always visible, that filters against every page in the app (Home, Dashboard, Customers, Inventory, Sales, Expenses, Reports, AI Assistant, Settings) plus the same quick actions from the Dashboard ("New sale," "Add customer," etc. — these open the destination page with its dialog already open, same `?new=1` mechanism from before). Type to filter, click a result or press Enter to jump there, Escape to clear. It's currently **navigation search only** — it does not search your actual customers/products data yet. That would need live API calls with debouncing against real records, which is a meaningfully bigger feature; happy to build it next if you want it, just flagging it's not in this delivery.

## 3. "Live" status removed

Dropped the green "Live" / gray "Sample content" badge from the news feed entirely, and the "Live" badge from Currency Watch (kept the "Updated X ago" freshness line on Currency Watch, since that's genuinely useful — swapped "Live exchange rates for {currency}" to just "Exchange rates for {currency}" in the description too).

## 4. More news stories — honest answer on the "60+" ask

GNews's free tier caps every single request at **10 articles maximum** — that's a hard platform limit, not something I can configure around. To get past that, the backend now fires off **7 parallel requests across different categories** (business, technology, general, world, science, health, national — deliberately skipping sports/entertainment as less relevant to a business feed) and merges, de-duplicates, and sorts the results by recency. That gets you **up to ~70 articles** before de-duplication (real-world count will usually land somewhat lower, since categories overlap).

**The real trade-off, worth knowing:** this now costs **7 requests per page load** instead of 1. Your free daily quota of 100 requests now supports roughly **14 full page loads per day** across everyone using the app, not ~100. The 30-minute client-side cache (`staleTime`) means repeated visits within that window don't cost anything extra, so for a single person testing/demoing this today it's very unlikely to be a problem — but if this goes to multiple real users, you'd want either a paid GNews plan or a server-side cache shared across users (currently each person's browser caches independently). Didn't build that caching layer given today's timeline, but it's a clean next step if you need it.

The article list on the Home page now scrolls within a capped height instead of making the whole page extremely long with 60-70 image cards stacked vertically.
