import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer';
import { usePendingAgentActions, useApproveAgentAction, useRejectAgentAction } from '@/hooks/useAgentActions';
import { formatRelativeTime } from '@/utils/formatRelativeTime';
import { getErrorMessage } from '@/utils/getErrorMessage';

const TYPE_LABEL: Record<string, string> = {
  CREATE_CUSTOMER: 'New customer',
  RECORD_SALE: 'New sale',
  RESTOCK_PRODUCT: 'Restock',
};

export function PendingApprovals() {
  const { data: actions, isLoading } = usePendingAgentActions();
  const approve = useApproveAgentAction();
  const reject = useRejectAgentAction();
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setDecidingId(id);
    try {
      await approve.mutateAsync(id);
      toast.success('Approved — it just happened.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDecidingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setDecidingId(id);
    try {
      await reject.mutateAsync(id);
      toast.success('Rejected — nothing was changed.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-primary" />
          Pending Approvals
        </CardTitle>
        <CardDescription>Things your AI has prepared but hasn't done yet — your call.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !actions?.length ? (
          <EmptyState
            icon={CheckCircle2}
            title="Nothing waiting on you"
            description="When the AI proposes a new customer or sale, it'll show up here for approval."
            compact
          />
        ) : (
          <StaggerContainer className="space-y-3">
            {actions.map((action) => {
              const isDeciding = decidingId === action.id;
              return (
                <StaggerItem key={action.id}>
                  <div className="rounded-xl border border-border p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-primary">
                        {TYPE_LABEL[action.type] || action.type}
                      </p>
                      <p className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeTime(action.createdAt)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-medium">{action.summary}</p>
                    {action.reasoning && (
                      <p className="mt-1 text-xs italic text-muted-foreground">"{action.reasoning}"</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        isLoading={isDeciding && approve.isPending}
                        disabled={isDeciding}
                        onClick={() => handleApprove(action.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        isLoading={isDeciding && reject.isPending}
                        disabled={isDeciding}
                        onClick={() => handleReject(action.id)}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </CardContent>
    </Card>
  );
}
