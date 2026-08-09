import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { geminiService } from './gemini.service';
import { dashboardService } from './dashboard.service';
import { formatCurrencyForPrompt } from '../utils/formatCurrency';
import { AGENT_TOOL_DECLARATIONS, executeAgentTool } from './agentTools.service';

const HISTORY_LIMIT = 10; // recent turns kept for conversational context
const MAX_MESSAGE_LENGTH = 2000;

async function buildSystemPrompt(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { businessName: true, currency: true },
  });
  if (!user) throw ApiError.notFound('User not found');

  const summary = await dashboardService.getSummary(userId);
  const fmt = (n: number) => formatCurrencyForPrompt(n, user.currency);

  const lowStockList = summary.lowStock.length
    ? summary.lowStock.map((p) => `- ${p.name}: ${p.stockQuantity} left (threshold ${p.lowStockThreshold})`).join('\n')
    : 'None — stock levels look healthy.';

  const recentSales = summary.recentTransactions.length
    ? summary.recentTransactions
        .slice(0, 5)
        .map((t) => `- ${t.customerName}: ${t.itemsSummary || 'items'} — ${fmt(t.totalAmount)} (${t.paymentStatus})`)
        .join('\n')
    : 'No sales recorded yet.';

  return `You are the AI Agent inside BizPilot AI, a business operating system for small business owners. You are speaking directly to the owner of "${user.businessName}", and you can act on their behalf, not just talk.

You have tools to search customers, propose new customers, search products, and propose complete sales. IMPORTANT: create_customer and record_sale never happen immediately — every one of your proposals is queued in the owner's Pending Approvals, and only actually happens once the owner approves it. You are a COO who prepares decisions for the owner to sign off on, not someone who acts unilaterally. Never tell the owner something "has been done" when you've only proposed it — say you've prepared it and it's awaiting their approval.

How to handle a sale request (e.g. "Sell 3 Peak Milk and 2 Coca-Cola to John"):
1. Call search_customers with the name mentioned. If exactly one clear match exists, use it.
2. If no match exists, tell the owner you couldn't find that customer, then ask ONLY for their name (if not already clear) and phone number — these are required. Once you have both, call create_customer. Afterwards, you may ask if they want to add a business name, email, or address, but never block the sale on these — they're optional and can be skipped.
3. If multiple customers plausibly match, ask the owner to clarify which one before proceeding.
4. Call search_products for each product mentioned. If a product isn't found or doesn't have enough stock, tell the owner clearly — do not guess a productId or invent stock levels.
5. Once every item is resolved, ask how the sale is being paid: fully paid now, on credit (nothing paid yet), or a partial payment (some amount now, the rest owed). Get a specific amount before calling record_sale.
6. Call record_sale with the resolved customer, items, payment method, amount paid, and a short 'reason' explaining why you're proposing it. This queues one proposal that — once approved — handles everything automatically: inventory, debt tracking, invoice, receipt, and blockchain hash.
7. After it queues, tell the owner clearly what you've prepared: what would be sold, the total, how much would be owed (if anything), and that it's waiting in their Pending Approvals for a final decision.

General rules:
- Be concise, warm, and practical — this is a busy small business owner, not a data analyst.
- Use their currency (${user.currency}) for all amounts.
- Never fabricate a customer, product, price, or stock level — always search first.
- If something is ambiguous (which "John," which product), ask a short clarifying question instead of guessing.
- If a tool call fails (e.g. insufficient stock), explain plainly what went wrong and what the owner could do instead.
- When asked to write marketing copy (adverts, promotions, campaigns), write it ready to copy-paste — no placeholders like [Business Name], use the real business name.
- If the data below doesn't cover what they're asking, say so honestly rather than inventing numbers.
- Keep responses focused; use short paragraphs or bullet points rather than long essays.

Current business snapshot (as of now):
- Today's revenue: ${fmt(summary.todayStats.revenue)}
- Today's net profit: ${fmt(summary.todayStats.netProfit)}
- Today's sales count: ${summary.todayStats.salesCount}
- Total customers: ${summary.totalCustomers}

Low stock items:
${lowStockList}

Recent transactions:
${recentSales}`;
}

export const aiService = {
  async chat(userId: string, message: string) {
    const trimmed = message.trim();
    if (!trimmed) {
      throw ApiError.badRequest('Message cannot be empty');
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      throw ApiError.badRequest(`Message is too long (max ${MAX_MESSAGE_LENGTH} characters)`);
    }

    const systemPrompt = await buildSystemPrompt(userId);

    // Recent history gives the model conversational continuity
    const recentHistory = await prisma.aiChatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_LIMIT,
    });
    const historyBlock = recentHistory
      .reverse()
      .map((m) => `${m.role === 'USER' ? 'Owner' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const promptWithHistory = historyBlock
      ? `${systemPrompt}\n\nConversation so far:\n${historyBlock}\n\nOwner: ${trimmed}`
      : `${systemPrompt}\n\nOwner: ${trimmed}`;

    const agentResult = await geminiService.runAgentTurn(
      systemPrompt,
      promptWithHistory,
      AGENT_TOOL_DECLARATIONS,
      (call) => executeAgentTool(userId, call.name, call.args)
    );

    await prisma.aiChatMessage.createMany({
      data: [
        { userId, role: 'USER', content: trimmed },
        { userId, role: 'ASSISTANT', content: agentResult.text },
      ],
    });

    // Only mutating tool calls are worth surfacing to the UI as "the agent
    // proposed something" — search_customers/search_products are just
    // internal lookups the model made along the way. Nothing here has
    // actually happened yet; it's queued in Pending Approvals.
    const actionsPerformed = agentResult.toolCalls
      .filter((call) => call.name === 'create_customer' || call.name === 'record_sale')
      .map((call) => {
        const result = call.result as { success: boolean; data?: { actionId?: string; message?: string } };
        return {
          type: 'action_queued' as const,
          label: result.data?.message || 'Prepared an action — awaiting your approval',
          actionId: result.data?.actionId,
        };
      });

    return { reply: agentResult.text, createdAt: new Date(), actionsPerformed };
  },

  async getHistory(userId: string, limit = 50) {
    const messages = await prisma.aiChatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
    return messages;
  },

  async clearHistory(userId: string) {
    await prisma.aiChatMessage.deleteMany({ where: { userId } });
  },
};
