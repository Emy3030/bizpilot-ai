import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DashboardSummary } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatCurrency';

function buildInsight(summary: DashboardSummary, currency: string): string {
  const { todayStats, lowStockCount } = summary;

  if (todayStats.salesCount === 0 && lowStockCount === 0) {
    return "No sales logged yet today, and stock levels look healthy. Once you start recording sales, I'll surface trends and restock tips here.";
  }

  const parts: string[] = [];

  if (todayStats.salesCount > 0) {
    parts.push(
      `You've made ${todayStats.salesCount} sale${todayStats.salesCount === 1 ? '' : 's'} today, bringing in ${formatCurrency(
        todayStats.revenue,
        currency
      )} in revenue with ${formatCurrency(todayStats.netProfit, currency)} net profit after expenses.`
    );
  } else {
    parts.push('No sales recorded yet today.');
  }

  if (lowStockCount > 0) {
    parts.push(
      `${lowStockCount} product${lowStockCount === 1 ? ' is' : 's are'} running low — worth restocking soon to avoid missed sales.`
    );
  }

  return parts.join(' ');
}

export function AIInsightsCard({ summary, currency }: { summary: DashboardSummary; currency: string }) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Insights
        </CardTitle>
        <CardDescription>A quick read on how today is going</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-foreground/90">{buildInsight(summary, currency)}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Full conversational insights, restock suggestions, and campaign generation arrive with the AI Assistant module.
        </p>
      </CardContent>
    </Card>
  );
}
