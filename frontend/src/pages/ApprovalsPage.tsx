import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/ui/section-heading';
import { PageTransition } from '@/components/motion/PageTransition';
import { FadeInSection } from '@/components/motion/FadeInSection';
import { PendingApprovals } from '@/components/ai/PendingApprovals';

export default function ApprovalsPage() {
  return (
    <AppLayout>
      <PageTransition>
        <SectionHeading
          title="Approvals"
          description="Everything your AI team has prepared but hasn't done yet — nothing executes without your say-so."
        />

        <FadeInSection delay={0.05}>
          <PendingApprovals />
        </FadeInSection>
      </PageTransition>
    </AppLayout>
  );
}
