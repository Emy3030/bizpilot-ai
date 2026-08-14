import { Crown, Lightbulb, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { AGENT_ICON } from '@/components/ai/AgentsOverview';
import { useAgents } from '@/hooks/useAgents';

/** Condensed view of what the agent team is currently recommending — the
 *  full per-agent status grid lives on the AI COO page (AgentsOverview);
 *  this pulls the same real data and just surfaces the recommendations. */
export function AIRecommendations() {
  const { data: agents, isLoading } = useAgents();
  const recommendations = agents?.filter((a) => !!a.recommendation) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4 text-primary" />
          AI Recommendations
        </CardTitle>
        <CardDescription>What your agent team suggests right now</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : recommendations.length === 0 ? (
          <EmptyState icon={Lightbulb} title="No recommendations right now" description="Everything looks steady." compact />
        ) : (
          <div className="space-y-3">
            {recommendations.slice(0, 4).map((agent) => {
              const Icon = AGENT_ICON[agent.id] || Crown;
              return (
                <div key={agent.id} className="flex items-start gap-2.5 rounded-lg border border-border p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">{agent.name}</p>
                    <p className="mt-0.5 text-sm leading-relaxed">{agent.recommendation}</p>
                  </div>
                </div>
              );
            })}
            <Link to="/ai-assistant" className="block text-center text-xs font-medium text-primary hover:underline">
              See full agent team
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
