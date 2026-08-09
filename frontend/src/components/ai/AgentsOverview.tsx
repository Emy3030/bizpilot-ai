import {
  Crown,
  LineChart,
  ShoppingCart,
  Boxes,
  Megaphone,
  HeartHandshake,
  Workflow,
  FileCheck2,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer';
import { useAgents } from '@/hooks/useAgents';
import { cn } from '@/utils/cn';

const AGENT_ICON: Record<string, typeof Crown> = {
  coo: Crown,
  finance: LineChart,
  sales: ShoppingCart,
  inventory: Boxes,
  marketing: Megaphone,
  'customer-success': HeartHandshake,
  operations: Workflow,
  document: FileCheck2,
};

export function AgentsOverview() {
  const { data: agents, isLoading } = useAgents();

  if (isLoading || !agents) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Agent Team</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your Agent Team</CardTitle>
        <CardDescription>Real status, derived from your actual business data</CardDescription>
      </CardHeader>
      <CardContent>
        <StaggerContainer className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {agents.map((agent) => {
            const Icon = AGENT_ICON[agent.id] || Crown;
            return (
              <StaggerItem key={agent.id}>
                <div className="h-full rounded-xl border border-border p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.role}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                        agent.confidence >= 70
                          ? 'bg-success/10 text-success'
                          : agent.confidence >= 45
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-secondary text-muted-foreground'
                      )}
                    >
                      {agent.confidence}% confidence
                    </span>
                  </div>

                  <p className="mt-2.5 text-xs text-muted-foreground">{agent.status}</p>

                  {agent.recommendation && (
                    <p className="mt-2 rounded-lg bg-primary/[0.06] p-2 text-xs leading-relaxed text-foreground/90">
                      {agent.recommendation}
                    </p>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </CardContent>
    </Card>
  );
}
