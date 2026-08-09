# BizPilot AI → Agentic AI — Integration Guide

Mirrors your project root. Copy `backend/` and `frontend/` from this zip into your project, overwrite when prompted, restart both dev servers.

## Summary of every file touched

| File | Status | Why |
|---|---|---|
| `backend/src/services/agentTools.service.ts` | **NEW** | Defines the 4 tools Gemini can call, and executes them against your existing `customerService`/`productService`/`saleService` — no new business logic, purely an adapter |
| `backend/src/services/gemini.service.ts` | Edited | Added the tool-calling loop (`runAgentTurn`); also fixed an invalid `gemini-3.5-flash` model name back to `gemini-1.5-flash` — that was silently breaking every AI response before this fix |
| `backend/src/services/ai.service.ts` | Edited | `chat()` now runs the agentic loop instead of plain text generation; system prompt expanded with the sales/customer-registration workflow rules; response now includes `actionsPerformed` |
| `frontend/src/types/ai.ts` | Edited | Added `AgentAction` type and `actionsPerformed` field |
| `frontend/src/hooks/useAiChat.ts` | Edited | Carries `actionsPerformed` onto the appended chat message |
| `frontend/src/components/ai/ChatBubble.tsx` | Edited | Renders a green "action taken" chip under the agent's reply when it actually did something |
| `frontend/src/components/ai/SuggestedPrompts.tsx` | Edited | Swapped in the agentic example prompts from your spec |

**Not touched, by design:** `ai.controller.ts`, `ai.routes.ts`, `ai.validator.ts`, `customer.service.ts`, `product.service.ts`, `sale.service.ts`, `schema.prisma`, every other module. Your existing manual "Add customer" / "New sale" dialogs on their respective pages still work exactly as before — this is additive, not a replacement.

## npm packages required
**None.** `@google/generative-ai@^0.21.0` was already in `backend/package.json` and already supports function calling.

## Prisma migrations required
**None.** Every tool reuses your existing `Customer`, `Product`, `Sale`, `SaleItem`, `Invoice`, `Receipt` tables exactly as they are. No schema changes.

## Environment variables required
**None new.** Uses your existing `GEMINI_API_KEY`. If that's already set, the agent works immediately.

## Routes required
**None new.** Everything runs through your existing `POST /api/v1/ai/chat` endpoint — the agent lives inside the conversation, not a separate API surface.

---

## How the agent actually works, step by step

1. User sends a message (e.g. "Sell 3 Peak Milk and 2 Coca-Cola to John") to the same `/ai/chat` endpoint as before.
2. `ai.service.ts` builds the system prompt (business snapshot + the new agent workflow rules) and calls `geminiService.runAgentTurn()` instead of the old `generate()`.
3. Gemini decides it needs information it doesn't have, and returns a function call instead of text — e.g. `search_customers({query: "John"})`.
4. `gemini.service.ts` catches that, calls `executeAgentTool()`, which runs `customerService.list(userId, {search: "John", ...})` — your real, existing, tenant-scoped customer search — and sends the result back to Gemini.
5. This repeats: Gemini might call `search_products` for "Peak Milk" and "Coca-Cola", ask the user a clarifying question if something's ambiguous, call `create_customer` if John doesn't exist yet (after collecting name + phone conversationally), and finally call `record_sale`.
6. `record_sale` calls your existing `saleService.create()` (stock check, decrement, debt tracking — all already built), then automatically calls `saleService.generateInvoice()` and `generateReceipt()` (blockchain hash included) — matching "generate invoice, generate receipt, generate blockchain hash... all automatically" from your spec.
7. The loop ends when Gemini has nothing left to look up and gives a final text answer, shown to the user along with a confirmation chip for anything it actually created or recorded.

The safety valve: `MAX_TOOL_ROUNDS = 6` in `gemini.service.ts` — if something goes wrong and Gemini tries to loop indefinitely, it's capped and returns whatever it has rather than hanging.

## How to test it

1. Make sure you have at least one product in Inventory (e.g. "Peak Milk", any stock/price) — the agent needs something real to sell.
2. Go to the AI Assistant page, and try, in order:
   - "Sell 2 [your product name] to a new customer named Test Customer" — should trigger search_customers (no match), then the agent asks for a phone number, you give it one (e.g. "08012345678"), it calls create_customer, then asks about payment, you say "fully paid", it calls record_sale and confirms with totals. Check the Customers page afterward — Test Customer should be there with a purchase.
   - "Sell 1 [your product name] to Test Customer" (now that they exist) — this time search_customers should find them immediately, no registration questions, straight to the sale.
   - "Sell 1000 [your product name] to Test Customer" (more than you have in stock) — the agent should say it's out of stock rather than recording an invalid sale.
   - "How is my business doing today?" — should still work exactly as before (no tools needed).
3. After any successful sale via chat, check: the Sales page shows the new sale, the product's stock decreased on Inventory, and (if unpaid/partial) the customer's outstanding debt updated on Customers.
4. If Gemini responds oddly or repeats itself, check your backend terminal logs — "[Gemini] agent turn failed" or "[Agent] Tool ... failed unexpectedly" will show exactly where it broke.

## Known limitation, stated plainly

Conversation history in AiChatMessage only stores the final text of each turn, not the raw tool-call sequence. Mid-conversation state (like "waiting for John's phone number") is inferred by Gemini from the plain-text history, not a hard state machine. Works well in practice, but if a user goes very off-topic mid-registration and returns much later, the agent might re-ask rather than perfectly resume. Flagging this since the original instructions asked for this kind of reasoning to be explained.

---

## Still outstanding from your original request

The Customers-page-as-CRM and Sales-page-as-history redesigns are not in this delivery — this delivery is the actual agentic capability, the thing a hackathon judge will actually test. Say the word when you want the page redesigns next.
