import { Sparkles } from 'lucide-react';
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
      <div
        className={cn(
          'max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
