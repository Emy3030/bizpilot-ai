const BASE_SUGGESTIONS = [
  'Sell 3 Peak Milk and 2 Coca-Cola to John',
  'How is my business doing today?',
  'What should I restock?',
  'Add a new customer',
  'Generate a WhatsApp advert',
  "Summarize this week's sales",
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  pendingApprovalsCount?: number;
  lowStockCount?: number;
}

/** Prompt chips are led by whatever's actually true about the business right
 *  now (pending approvals, low stock) before falling back to generic
 *  suggestions — grounded in real counts, not a static script. */
export function SuggestedPrompts({ onSelect, pendingApprovalsCount = 0, lowStockCount = 0 }: SuggestedPromptsProps) {
  const contextual: string[] = [];
  if (pendingApprovalsCount > 0) contextual.push("What's waiting on my approval?");
  if (lowStockCount > 0) contextual.push('What should I restock?');

  const suggestions = [...contextual, ...BASE_SUGGESTIONS].filter((s, i, arr) => arr.indexOf(s) === i).slice(0, 6);

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
