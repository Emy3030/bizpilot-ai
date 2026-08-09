import { Sparkles, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ChatMessage } from '@/types/ai';

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'USER';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
      )}
      <div className={cn('max-w-[80%]', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
          )}
        >
          {message.content}
        </div>

        {!isUser && message.actionsPerformed && message.actionsPerformed.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {message.actionsPerformed.map((action, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400"
              >
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {action.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
