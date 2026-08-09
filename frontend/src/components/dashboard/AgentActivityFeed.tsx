import { Bot, CheckCircle2, XCircle, AlertOctagon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

const STATUS_META: Record<string, { icon: typeof CheckCircle2; className: string; label: string }> = {
  EXECUTED: { icon: CheckCircle2, className: 'text-success', label: 'Approved' },
  REJECTED: { icon: XCircle, className: 'text-muted-foreground', label: 'Rejected' },
  FAILED: { icon: AlertOctagon, className: 'text-destructive', label: 'Failed' },
};

// Duck-typed on purpose — accepts both the dashboard summary's
// AgentActivityItem[] and the fuller AgentAction[] from types/agentAction,
// since both already carry every field this component needs.
interface ActivityLike {
  id: string;
  summary: string;
  status: string;
  createdAt: string;
}

export function AgentActivityFeed({ items }: { items: ActivityLike[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-4 w-4 text-primary" />
          AI Agent Activity
        </CardTitle>
        <CardDescription>What your AI team has already decided on</CardDescription>
      </CardHeader>
      <CardContent>
        {!items.length ? (
          <EmptyState
            icon={Bot}
            title="No activity yet"
            description="Approved or rejected AI proposals will show up here."
            compact
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const meta = STATUS_META[item.status] ?? { icon: Bot, className: 'text-muted-foreground', label: item.status };
              const Icon = meta.icon;
              return (
                <div key={item.id} className="flex items-start gap-2.5">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${meta.className}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{item.summary}</p>
                    <p className="text-xs text-muted-foreground">
                      {meta.label} · {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
