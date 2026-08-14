import { ShoppingCart } from 'lucide-react';
import { useAgents } from '@/hooks/useAgents';

/** Surfaces the Sales Agent's live recommendation (same data as the AI COO
 *  page) right where a sales decision is actually made. Renders nothing if
 *  there's no real recommendation right now — no placeholder text. */
export function SalesAgentBanner() {
  const { data: agents } = useAgents();
  const salesAgent = agents?.find((a) => a.id === 'sales');

  if (!salesAgent?.recommendation) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/[0.06] px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <ShoppingCart className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">Sales Agent</p>
        <p className="mt-0.5 text-sm leading-relaxed text-foreground/90">{salesAgent.recommendation}</p>
      </div>
    </div>
  );
}
