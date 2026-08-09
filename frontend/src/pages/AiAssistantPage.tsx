import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Send, Sparkles, Trash2, Loader2 } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ChatBubble } from '@/components/ai/ChatBubble';
import { SuggestedPrompts } from '@/components/ai/SuggestedPrompts';
import { TypingIndicator } from '@/components/ai/TypingIndicator';
import { PendingApprovals } from '@/components/ai/PendingApprovals';
import { AgentsOverview } from '@/components/ai/AgentsOverview';
import { AgentActivityFeed } from '@/components/dashboard/AgentActivityFeed';
import { PageTransition } from '@/components/motion/PageTransition';
import { FadeInSection } from '@/components/motion/FadeInSection';
import { useAiChatHistory, useSendAiMessage, useClearAiChat } from '@/hooks/useAiChat';
import { useRecentAgentActivity } from '@/hooks/useAgentActions';
import { getErrorMessage } from '@/utils/getErrorMessage';

export default function AiAssistantPage() {
  const { data: messages, isLoading } = useAiChatHistory();
  const { data: recentActivity } = useRecentAgentActivity();
  const sendMessage = useSendAiMessage();
  const clearChat = useClearAiChat();

  const [input, setInput] = useState('');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sendMessage.isPending]);

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

  const handleClear = async () => {
    try {
      await clearChat.mutateAsync();
      setClearDialogOpen(false);
      toast.success('Conversation cleared');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AppLayout>
      <PageTransition>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Sparkles className="h-5 w-5 text-primary" />
            AI COO
          </h2>
          <p className="text-sm text-muted-foreground">
            Your Chief Operating Officer — ask it anything, or review what it's already prepared below.
          </p>
        </div>
        {!!messages?.length && (
          <Button variant="outline" onClick={() => setClearDialogOpen(true)}>
            <Trash2 className="h-4 w-4" /> Clear chat
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="flex h-[70vh] flex-col">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !messages?.length ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">Here's what I'm watching — ask me what changed, or what needs attention.</p>
                <p className="text-sm text-muted-foreground">Try one of these to get started:</p>
              </div>
              <SuggestedPrompts onSelect={handleSend} />
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

        <CardContent className="border-t border-border p-4">
          {!!messages?.length && (
            <div className="mb-3">
              <SuggestedPrompts onSelect={handleSend} />
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Ask about sales, stock, or request marketing copy..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sendMessage.isPending}
            />
            <Button type="submit" isLoading={sendMessage.isPending} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <FadeInSection>
          <PendingApprovals />
        </FadeInSection>
        <FadeInSection delay={0.05}>
          <AgentsOverview />
        </FadeInSection>
        <FadeInSection delay={0.1}>
          <AgentActivityFeed items={recentActivity ?? []} />
        </FadeInSection>
      </div>
      </div>

      <ConfirmDialog
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        title="Clear conversation?"
        description="This will permanently delete your AI chat history. This can't be undone."
        confirmLabel="Clear"
        isLoading={clearChat.isPending}
        onConfirm={handleClear}
      />
      </PageTransition>
    </AppLayout>
  );
}
