import { useState } from 'react';
import { toast } from 'sonner';
import { useApproveAgentAction, useRejectAgentAction } from '@/hooks/useAgentActions';
import { getErrorMessage } from '@/utils/getErrorMessage';

/**
 * Shared approve/reject flow — previously hand-rolled identically in both
 * PendingApprovals (the full list) and CoPilotPanel (the condensed panel
 * view). Same mutations, same toasts, same "only one card busy at a time"
 * behavior; extracted once so the two surfaces can't drift apart.
 */
export function useApprovalDecision() {
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

  return {
    decidingId,
    isApproving: approve.isPending,
    isRejecting: reject.isPending,
    handleApprove,
    handleReject,
  };
}
