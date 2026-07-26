import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { geminiService } from './gemini.service';
import { dashboardService } from './dashboard.service';
import { formatCurrencyForPrompt } from '../utils/formatCurrency';

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

  return `You are the AI Assistant inside BizPilot AI, a business operating system for small business owners. You are speaking directly to the owner of "${user.businessName}".

Your job is to help them understand their business performance and take action — answering questions, summarizing sales, suggesting restocks, and drafting marketing copy (WhatsApp adverts, discount campaigns) when asked.

Style rules:
- Be concise, warm, and practical — this is a busy small business owner, not a data analyst.
- Use their currency (${user.currency}) for all amounts.
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

    const reply = await geminiService.generate(systemPrompt, promptWithHistory);

    await prisma.aiChatMessage.createMany({
      data: [
        { userId, role: 'USER', content: trimmed },
        { userId, role: 'ASSISTANT', content: reply },
      ],
    });

    return { reply, createdAt: new Date() };
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
