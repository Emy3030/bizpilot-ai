import { CalendarClock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

/** There is no task/event/calendar entity anywhere in the schema yet — this
 *  deliberately shows an honest empty state rather than fabricated tasks. */
export function UpcomingTasks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="h-4 w-4 text-primary" />
          Upcoming Tasks
        </CardTitle>
        <CardDescription>Scheduled follow-ups and events</CardDescription>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={CalendarClock}
          title="Task scheduling isn't built yet"
          description="This will show upcoming follow-ups and events once that module exists — nothing to show honestly right now."
          compact
        />
      </CardContent>
    </Card>
  );
}
