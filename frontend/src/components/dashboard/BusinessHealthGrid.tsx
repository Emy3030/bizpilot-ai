import { Gauge } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { HealthScoreCard } from '@/components/ui/health-score';
import { BusinessHealthBreakdown } from '@/types/dashboard';

interface BusinessHealthGridProps {
  health: BusinessHealthBreakdown;
  /** True when there's no sales history to assess yet — see HealthScorePill
   *  for why a deduction-based score looks falsely confident on a new
   *  account. Shows an honest explanation instead of five scores. */
  insufficientData?: boolean;
}

export function BusinessHealthGrid({ health, insufficientData }: BusinessHealthGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Business Health</CardTitle>
        <CardDescription>
          {insufficientData
            ? "We'll assess this once there's real activity to look at"
            : "Five signals, each derived from data on this page — not a model's guess"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {insufficientData ? (
          <EmptyState
            icon={Gauge}
            title="Not enough data yet"
            description="BizPilot needs at least one recorded sale to start assessing revenue, cash flow, and the rest of your business health — it won't guess in the meantime."
            compact
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <HealthScoreCard label="Revenue" score={health.revenue.score} status={health.revenue.label} />
            <HealthScoreCard label="Cash Flow" score={health.cashFlow.score} status={health.cashFlow.label} />
            <HealthScoreCard label="Operations" score={health.operations.score} status={health.operations.label} />
            <HealthScoreCard label="Customers" score={health.customers.score} status={health.customers.label} />
            <HealthScoreCard label="Inventory" score={health.inventory.score} status={health.inventory.label} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
