const SUGGESTIONS = [
  'How is my business doing today?',
  'What product is selling most?',
  'What should I restock?',
  'Generate a WhatsApp advert',
  'Generate a discount campaign',
  "Summarize this week's sales",
];

export function SuggestedPrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTIONS.map((s) => (
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
