import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer';
import { ApprovalCard } from '@/components/ai/ApprovalCard';
import { usePendingAgentActions } from '@/hooks/useAgentActions';
import { useApprovalDecision } from '@/hooks/useApprovalDecision';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { AgentAction } from '@/types/agentAction';

export const TYPE_LABEL: Record<string, string> = {
  CREATE_CUSTOMER: 'New customer',
  RECORD_SALE: 'New sale',
  RESTOCK_PRODUCT: 'Restock',
};

// Derives a concrete "if approved" line from the action's own real payload —
// never a placeholder. Returns null when the payload doesn't have enough to
// say something concrete, and the card simply omits the impact line.
export function getImpactLine(action: AgentAction, currency: string): string | null {
  const payload = action.payload as Record<string, unknown>;
  switch (action.type) {
    case 'RESTOCK_PRODUCT': {
      const qty = payload.quantity;
      return typeof qty === 'number' ? `+${qty} units added to inventory` : null;
    }
    case 'RECORD_SALE': {
      const items = Array.isArray(payload.items) ? payload.items.length : null;
      const amountPaid = typeof payload.amountPaid === 'number' ? payload.amountPaid : null;
      if (items === null) return null;
      return `${items} item${items === 1 ? '' : 's'} sold${amountPaid !== null ? `, ${formatCurrency(amountPaid, currency)} received` : ''}, stock updated automatically`;
    }
    case 'CREATE_CUSTOMER':
      return 'Added to your customer list, ready to attach to future sales';
    default:
      return null;
  }
}

export function PendingApprovals() {
  const { user } = useAuth();
  const currency = user?.currency || 'NGN';
  const { data: actions, isLoading } = usePendingAgentActions();
  const { decidingId, isApproving, isRejecting, handleApprove, handleReject } = useApprovalDecision();

  const hasActions = !!actions?.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-primary" />
          Pending Approvals
        </CardTitle>
        <CardDescription>
          {hasActions
            ? 'BizPilot found something that needs your attention. Review it, then approve or reject — approved actions execute immediately.'
            : "Things your AI has prepared but hasn't done yet — your call."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !hasActions ? (
          <EmptyState
            icon={CheckCircle2}
            title="Nothing waiting on you"
            description="When the AI proposes a new customer or sale, it'll show up here for approval."
            compact
          />
        ) : (
          <StaggerContainer className="space-y-3">
            {actions!.map((action) => (
              <StaggerItem key={action.id}>
                <ApprovalCard
                  typeLabel={TYPE_LABEL[action.type] || action.type}
                  summary={action.summary}
                  reasoning={action.reasoning}
                  impact={getImpactLine(action, currency)}
                  createdAt={action.createdAt}
                  isDeciding={decidingId === action.id}
                  isApproving={isApproving}
                  isRejecting={isRejecting}
                  onApprove={() => handleApprove(action.id)}
                  onReject={() => handleReject(action.id)}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </CardContent>
    </Card>
  );
}
