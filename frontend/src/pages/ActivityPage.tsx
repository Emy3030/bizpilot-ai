import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/ui/section-heading';
import { PageTransition } from '@/components/motion/PageTransition';
import { FadeInSection } from '@/components/motion/FadeInSection';
import { AgentActivityFeed } from '@/components/dashboard/AgentActivityFeed';
import { useAgentActionHistory } from '@/hooks/useAgentActions';

export default function ActivityPage() {
  const { data: actions } = useAgentActionHistory();

  return (
    <AppLayout>
      <PageTransition>
        <SectionHeading title="Activity" description="The full history of what your AI agent team has proposed and done" />

        <FadeInSection delay={0.05}>
          <AgentActivityFeed items={actions ?? []} />
        </FadeInSection>
      </PageTransition>
    </AppLayout>
  );
}
