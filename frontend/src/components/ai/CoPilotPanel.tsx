import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { X, Send, Sparkles, Loader2, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HealthScorePill } from '@/components/ui/health-score';
import { ChatBubble } from '@/components/ai/ChatBubble';
import { SuggestedPrompts } from '@/components/ai/SuggestedPrompts';
import { TypingIndicator } from '@/components/ai/TypingIndicator';
import { ApprovalCard } from '@/components/ai/ApprovalCard';
import { TYPE_LABEL, getImpactLine } from '@/components/ai/PendingApprovals';
import { useAiChatHistory, useSendAiMessage } from '@/hooks/useAiChat';
import { usePendingAgentActions } from '@/hooks/useAgentActions';
import { useApprovalDecision } from '@/hooks/useApprovalDecision';
import { useMissionControl } from '@/hooks/useDashboardSummary';
import { useAuth } from '@/context/AuthContext';
import { useCoPilot } from '@/context/CoPilotContext';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { cn } from '@/utils/cn';

const APPROVALS_SHOWN_IN_PANEL = 2;

/**
 * The persistent BizPilot COO surface — same conversation (same React Query
 * cache key) as the full /ai-assistant Workspace, just a condensed,
 * always-available view. Mounted once above <Routes> in App.tsx so it
 * survives page navigation instead of resetting every time a page remounts.
 */
export function CoPilotPanel() {
  const { isAuthenticated, user } = useAuth();
  const { isOpen, close } = useCoPilot();
  const location = useLocation();
  const currency = user?.currency || 'NGN';

  // The full Workspace page (/ai-assistant) already shows this exact
  // conversation — opening the panel there would show it a second time.
  // Force-close on arrival there (not just suppress the button) so state
  // doesn't stay stale-open for the next page the user visits.
  const isOnWorkspace = location.pathname === '/ai-assistant';
  useEffect(() => {
    if (isOnWorkspace) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnWorkspace]);
  const effectiveOpen = isOpen && !isOnWorkspace;

  const { data: messages, isLoading } = useAiChatHistory();
  const sendMessage = useSendAiMessage();
  const { data: pendingActions } = usePendingAgentActions();
  const { data: missionControl } = useMissionControl();
  const { decidingId, isApproving, isRejecting, handleApprove, handleReject } = useApprovalDecision();

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (effectiveOpen) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sendMessage.isPending, effectiveOpen]);

  if (!isAuthenticated) return null;

  const handleSend = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || sendMessage.isPending) return;
    setInput('');
    try {
      await sendMessage.mutateAsync(message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const shownApprovals = pendingActions?.slice(0, APPROVALS_SHOWN_IN_PANEL) ?? [];
  const remainingApprovals = (pendingActions?.length ?? 0) - shownApprovals.length;

  return (
    <>
      {effectiveOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-out sm:w-[420px]',
          effectiveOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        )}
        aria-hidden={!effectiveOpen}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">BizPilot COO</p>
              <p className="text-xs text-muted-foreground">Your AI executive</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/ai-assistant" onClick={close}>
                Full workspace
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={close} aria-label="Close panel">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {missionControl && (
          <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-border px-4 py-2.5">
            <HealthScorePill
              label="Health"
              score={missionControl.healthScore}
              status={missionControl.healthLabel}
              insufficientData={missionControl.recentTransactions.length === 0}
            />
            {missionControl.pendingApprovalsCount > 0 && (
              <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                <Clock className="h-3 w-3" /> {missionControl.pendingApprovalsCount} pending
              </span>
            )}
          </div>
        )}

        {shownApprovals.length > 0 && (
          <div className="shrink-0 space-y-2 border-b border-border p-3">
            <p className="px-0.5 text-xs text-muted-foreground">
              BizPilot found something that needs your attention — review, then approve or reject.
            </p>
            {shownApprovals.map((action) => (
              <ApprovalCard
                key={action.id}
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
            ))}
            {remainingApprovals > 0 && (
              <Link
                to="/approvals"
                onClick={close}
                className="block text-center text-xs font-medium text-primary hover:underline"
              >
                +{remainingApprovals} more waiting — view all approvals
              </Link>
            )}
          </div>
        )}

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : !messages?.length ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Ask me anything about your business.</p>
              <SuggestedPrompts
                onSelect={handleSend}
                pendingApprovalsCount={missionControl?.pendingApprovalsCount}
                lowStockCount={missionControl?.lowStockCount}
              />
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <ChatBubble key={m.id} message={m} />
              ))}
              {sendMessage.isPending && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <TypingIndicator />
                </div>
              )}
            </>
          )}
        </div>

        <div className="shrink-0 border-t border-border p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              aria-label="Message the BizPilot COO"
              placeholder="Ask the COO..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sendMessage.isPending}
            />
            <Button type="submit" isLoading={sendMessage.isPending} disabled={!input.trim()} aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
