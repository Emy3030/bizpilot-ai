# BizPilot AI

**The AI-Powered Business Operating System with Onchain Trust.**

BizPilot AI helps small businesses manage customers, inventory, sales, and expenses — while using blockchain to create tamper-proof records for the documents that actually need trust (invoices and receipts). Everything else stays off-chain, fast, and free.

---

## Table of contents

- [Problem & approach](#problem--approach)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Modules](#modules)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Deploying the smart contract](#deploying-the-smart-contract)
- [Deployment (production)](#deployment-production)
- [API overview](#api-overview)
- [Known limitations](#known-limitations-read-before-a-demo)

---

## Problem & approach

Small businesses lose money to poor record keeping, fake receipts, inventory theft, payment disputes, and lack of visibility into what's actually happening day to day. BizPilot AI addresses this with three layers:

1. **Operations** — customers, inventory, sales, and expenses, all in one place.
2. **Insight** — a dashboard and reports layer that turns that data into daily/weekly/monthly numbers, plus an AI assistant (Gemini) that can answer questions and draft marketing copy from live business data.
3. **Trust** — every invoice and receipt gets a SHA-256 hash of its contents anchored on Base Sepolia. The document itself never touches the blockchain — only proof that it hasn't been altered since it was issued. Anyone can scan a receipt's QR code and verify it independently, with no login required.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite) + TypeScript + Tailwind CSS + shadcn-style components + Framer Motion + React Router + React Query |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT |
| Blockchain | Base Sepolia testnet, Solidity, ethers.js |
| AI | Google Gemini API |
| PDF / QR | pdfkit, qrcode |
| Deploy targets | Frontend to Vercel, Backend to Render, Database on Neon |

---

## Project structure

```
bizpilot-ai/
├── backend/            Express API (TypeScript)
│   ├── prisma/          schema.prisma - the single source of truth for the data model
│   ├── src/
│   │   ├── config/       env loader, Prisma client, contract ABI
│   │   ├── controllers/  one per resource (auth, customer, product, sale, ...)
│   │   ├── services/     business logic - this is where the real work happens
│   │   ├── middleware/   auth guard, error handler, validation, upload (multer)
│   │   ├── routes/       route definitions, mounted under /api/v1
│   │   ├── validators/   express-validator rule sets
│   │   └── utils/        ApiError, asyncHandler, JWT helpers, hashing, currency formatting
│   └── uploads/          product images, generated PDFs, QR codes (local disk - see limitations)
│
├── frontend/            Vite React app
│   └── src/
│       ├── components/   organized by feature (dashboard/, customers/, inventory/, sales/, expenses/, reports/, ai/) + shared ui/ primitives
│       ├── context/       AuthContext, ThemeContext
│       ├── hooks/         one React Query hook module per resource
│       ├── pages/         one page per route
│       ├── services/      axios API clients, one per resource
│       ├── types/         TypeScript types matching backend response shapes
│       └── utils/          currency/date formatting, zod schemas, cn(), error extraction
│
└── contracts/           Hardhat project for the TrustRegistry smart contract
    ├── contracts/TrustRegistry.sol
    └── scripts/deploy.js
```

Each business domain (customers, inventory, sales, expenses, reports, AI) follows the same pattern end to end: Prisma model to service to controller to validator to route on the backend; type to API client to React Query hook to components to page on the frontend. Once you're oriented in one module, the rest read the same way.

---

## Modules

1. **Authentication** - register/login, JWT, protected routes
2. **Dashboard** - today's sales/profit, low stock, AI insight, recent transactions, 7-day trend chart
3. **Customers** - CRUD, search, outstanding debt, purchase history
4. **Inventory** - products + categories, barcode field, product images, low-stock alerts
5. **Sales** - cart-based sale creation, stock deduction, partial payments, PDF invoice/receipt generation, verification QR codes
6. **Expenses** - categorized expense logging, daily/weekly/monthly summaries
7. **Reports** - revenue/profit/expenses by period, best-selling products, trend charts
8. **AI Assistant** - Gemini-powered chat with live business context, marketing copy generation
9. **Blockchain trust layer** - Solidity TrustRegistry contract on Base Sepolia; every invoice/receipt hash is anchored on creation, verifiable at /verify/:hash with no login required

---

## Local setup

### Prerequisites
- Node.js 18+
- A PostgreSQL database (local, or a free Neon instance at neon.tech)
- A Google Gemini API key from aistudio.google.com/apikey (free tier available) - optional but needed for the AI Assistant to respond
- A funded Base Sepolia wallet - optional, only needed for on-chain anchoring (see "Deploying the smart contract")

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env - at minimum set DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npm run dev
```

The API runs on http://localhost:5000 by default (/api/v1/health should return { success: true }).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL defaults to http://localhost:5000/api/v1 - only change if your backend runs elsewhere
npm run dev
```

The app runs on http://localhost:5173.

### 3. (Optional) Smart contract

Only needed if you want invoices/receipts to actually anchor on-chain instead of sitting at chainStatus: PENDING. See "Deploying the smart contract" below.

---

## Environment variables

### backend/.env

| Variable | Required | Purpose |
|---|---|---|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | Signs auth tokens - use a long random string |
| JWT_EXPIRES_IN | No | Defaults to 7d |
| PORT | No | Defaults to 5000 |
| CLIENT_URL | Yes | Frontend origin, used for CORS and building QR verification links |
| GEMINI_API_KEY | No* | AI Assistant returns a graceful "not configured" message without it |
| BASE_SEPOLIA_RPC_URL | No | Defaults to the public sepolia.base.org RPC |
| BLOCKCHAIN_PRIVATE_KEY | No* | Wallet used to submit anchor transactions |
| TRUST_REGISTRY_CONTRACT_ADDRESS | No* | Deployed TrustRegistry address |

\* The app runs and demos fine without the starred variables - those features degrade gracefully (AI gives an honest fallback message; documents get chainStatus: PENDING instead of CONFIRMED) rather than breaking anything else.

### frontend/.env

| Variable | Required | Purpose |
|---|---|---|
| VITE_API_URL | Yes | Backend API base URL, including /api/v1 |

### contracts/.env

| Variable | Required | Purpose |
|---|---|---|
| BASE_SEPOLIA_RPC_URL | No | Defaults to the public RPC |
| BLOCKCHAIN_PRIVATE_KEY | Yes (for deploy) | Deploys the contract from this wallet |

---

## Deploying the smart contract

```bash
cd contracts
npm install
cp .env.example .env
# add BLOCKCHAIN_PRIVATE_KEY - use a throwaway dev wallet, never a real one
```

Fund that wallet with free Base Sepolia ETH from a faucet (e.g. Alchemy's Base Sepolia faucet at alchemy.com/faucets/base-sepolia), then:

```bash
npx hardhat compile
npm run deploy:baseSepolia
```

This prints the deployed contract address. Add it, along with the same private key, to backend/.env:

```
BLOCKCHAIN_PRIVATE_KEY="<the same key you deployed with>"
TRUST_REGISTRY_CONTRACT_ADDRESS="<address printed by the deploy script>"
```

From then on, every invoice/receipt generated calls anchorDocument(hash) on the contract, waits for one confirmation, and stores the resulting transaction hash. GET /api/v1/verify/:hash (and the /verify/:hash page) will show chainStatus: CONFIRMED and link to the transaction on BaseScan.

---

## Deployment (production)

| Piece | Target | Notes |
|---|---|---|
| Frontend | Vercel | Set VITE_API_URL to your deployed backend's URL |
| Backend | Render | Set all backend/.env variables in the Render dashboard; run npx prisma migrate deploy as part of your build/release step |
| Database | Neon | Free tier is enough for a demo; use the pooled connection string for DATABASE_URL |

Read the limitations section below before deploying - the current image/PDF/QR storage approach uses local disk, which doesn't survive Render's ephemeral filesystem across deploys.

---

## API overview

All routes are mounted under /api/v1. Authenticated routes require Authorization: Bearer <token>.

| Resource | Base path |
|---|---|
| Auth | /auth (register, login, me) |
| Dashboard | /dashboard/summary |
| Customers | /customers |
| Categories (products) | /categories |
| Products | /products |
| Sales | /sales (+ /sales/:id/payments, /sales/:id/invoice, /sales/:id/receipt) |
| Expense categories | /expense-categories |
| Expenses | /expenses (+ /expenses/summary) |
| Reports | /reports/summary |
| AI Assistant | /ai/chat, /ai/history |
| Verification (public, no auth) | /verify/:hash |

---

## Known limitations (read before a demo)

- **Uploaded images, generated PDFs, and QR codes are stored on local disk** (backend/uploads/). This works for local development and is fine for a live demo run from your machine, but Render's filesystem is ephemeral - anything written there is lost on redeploy or restart. For anything beyond a hackathon demo, swap this for S3, Cloudinary, or similar.
- **On-chain anchoring costs testnet ETH and takes a few seconds per document.** Each invoice/receipt generation is a real blockchain transaction that waits for confirmation. Keep the configured wallet funded, and expect a short delay (2-5s) when generating documents once blockchain is wired up.
- **The AI Assistant needs a real Gemini API key to do anything beyond a fallback message.** It won't crash without one, but it also won't answer questions.
- This is a hackathon MVP: no automated test suite, no email verification, no multi-currency conversion (the app displays one currency per business, set at signup), and no role-based permission enforcement beyond the OWNER/STAFF field existing in the schema for future use.
