# Customer Workflow + Quick Actions + Settings + Home — Merge Instructions

Mirrors your project root exactly. Copy `backend/` and `frontend/` from this zip into your project, overwrite when prompted, restart both dev servers.

## ⚠️ Important: App.tsx is a full reconstruction, not a small edit

While building this, I found that my own working copy of `App.tsx` had drifted from what your actual project has — every route since Module 3 was only ever given to you as a manual "add this route" instruction, never actually applied to my copy. Rather than risk handing you a stale file that would silently delete your Customers/Inventory/Sales/Expenses/Reports/AI Assistant/Verify routes, I rebuilt it from scratch with **every route your project should have**, old and new. The version in this zip is the complete, correct file — safe to overwrite wholesale. If you'd made any custom edits of your own to `App.tsx` since I last gave you route instructions, let me know and I'll fold those back in.

## Files (6 NEW, 18 OVERWRITTEN)

**New:**
```
frontend/src/utils/settingsSchemas.ts
frontend/src/hooks/useSettings.ts
frontend/src/components/home/BusinessPulseFeed.tsx
frontend/src/components/home/CurrencyWatchCard.tsx
frontend/src/pages/HomePage.tsx
frontend/src/pages/SettingsPage.tsx
```

**Overwritten:**
```
backend/src/services/sale.service.ts
backend/src/services/auth.service.ts
backend/src/controllers/auth.controller.ts
backend/src/validators/sale.validator.ts
backend/src/validators/auth.validator.ts
backend/src/routes/auth.routes.ts
frontend/src/types/sale.ts
frontend/src/types/auth.ts
frontend/src/services/authApi.ts
frontend/src/context/AuthContext.tsx
frontend/src/components/layout/AppLayout.tsx
frontend/src/components/dashboard/QuickActions.tsx
frontend/src/components/sales/NewSaleDialog.tsx
frontend/src/pages/CustomersPage.tsx
frontend/src/pages/InventoryPage.tsx
frontend/src/pages/SalesPage.tsx
frontend/src/pages/ExpensesPage.tsx
frontend/src/App.tsx
```

No new npm packages. No database migration needed (no schema changes — `Customer.address` already existed).

---

## 1. Add customer's address inline, on the Sales screen

Same combobox from before, now with an address field alongside phone — both only appear once you're typing a name that doesn't match an existing customer, and both get saved to the new customer record along with the sale.

## 2. Quick Actions now actually work

Each of the four Dashboard quick-action buttons navigates to its page and automatically opens that page's "add" dialog (via a `?new=1` URL parameter each page checks for on load, then cleans up). Click "New sale" → lands on `/sales` with the New Sale dialog already open. Same for Add customer, Add product, Log expense.

## 3. Settings page — new

Reachable via the sidebar. Three sections:
- **Business profile**: business name, your name, currency (email is shown but disabled — no verification flow built for changing it yet, flagged honestly in the UI rather than silently allowing an unverified change).
- **Security**: change password, requires the current password to be entered correctly first.
- **Appearance**: the same dark/light toggle from the header, surfaced here too since that's where people expect to find it.
- **Session**: a log-out button.

## 4. Home page — new, reachable via the logo and a new "Home" nav item

Split into what's real and what isn't, clearly labeled as such:

- **Today's revenue, net profit, and top seller** — real data, pulled from your existing dashboard/reports endpoints. No new backend work needed, just reused what already exists.
- **"Business pulse"** — evergreen small-business tips, explicitly labeled "Sample content" with a note that a live news API would need to be connected to make it real. I did **not** fabricate dated news headlines or attribute them to fake sources, and deliberately **left out political content entirely** — inventing political news is a real misinformation risk I didn't think was worth taking for a placeholder feed section.
- **"Currency watch"** — shows no numbers at all. I didn't want to make up exchange rates that could be mistaken for real data and accidentally used in actual pricing decisions. It's a clearly-labeled "not connected yet" placeholder, ready for a real FX API (exchangerate.host, Open Exchange Rates, etc.) whenever you want to wire one in.

**Logo behavior**: the brand mark is now a link to `/home` in the desktop sidebar, the mobile drawer, and — new — a compact version now sits in the mobile header next to the hamburger menu, so it's visible and clickable on every screen size, not just desktop.
