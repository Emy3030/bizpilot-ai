import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

interface ApprovalCardProps {
  typeLabel: string;
  /** WHAT the AI wants to do. */
  summary: string;
  /** WHY it's proposing this — the AI's stated reasoning, when it gave one. */
  reasoning?: string | null;
  /** The concrete effect if approved (e.g. "+10 units added to inventory").
   *  Omitted entirely when the caller can't derive one from real data —
   *  never filled with a placeholder. */
  impact?: string | null;
  createdAt: string;
  isDeciding?: boolean;
  isApproving?: boolean;
  isRejecting?: boolean;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * Shared approval card — WHAT / WHY / IMPACT / decision. There is
 * deliberately no "confidence score" field: nothing in AgentAction's data
 * model produces one today, and a fabricated percentage would be exactly
 * the kind of dishonest UI this product is built to avoid. Add it here the
 * day a real confidence signal exists, not before.
 */
export function ApprovalCard({
  typeLabel,
  summary,
  reasoning,
  impact,
  createdAt,
  isDeciding,
  isApproving,
  isRejecting,
  onApprove,
  onReject,
}: ApprovalCardProps) {
  return (
    <div className="rounded-xl border border-border p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-primary">{typeLabel}</p>
        <p className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(createdAt)}</p>
      </div>

      <p className="mt-1 text-sm font-medium">{summary}</p>

      {reasoning && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary/70" />
          <p className="italic">"{reasoning}"</p>
        </div>
      )}

      {impact && (
        <div className="mt-2 rounded-lg bg-secondary/60 px-2.5 py-1.5 text-xs text-foreground/80">
          <span className="font-medium text-foreground">If approved: </span>
          {impact}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          isLoading={isDeciding && isApproving}
          disabled={isDeciding}
          onClick={onApprove}
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          isLoading={isDeciding && isRejecting}
          disabled={isDeciding}
          onClick={onReject}
        >
          <XCircle className="h-3.5 w-3.5" /> Reject
        </Button>
      </div>
    </div>
  );
}
