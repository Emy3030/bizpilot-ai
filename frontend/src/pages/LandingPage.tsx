import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { ExecutiveMetrics } from '@/components/landing/ExecutiveMetrics';
import { AiExecutiveTeam } from '@/components/landing/AiExecutiveTeam';
import { BusinessWorkflow } from '@/components/landing/BusinessWorkflow';
import { MissionControlPreview } from '@/components/landing/MissionControlPreview';
import { ExecutiveOutcomes } from '@/components/landing/ExecutiveOutcomes';
import { IndustryUseCases } from '@/components/landing/IndustryUseCases';
import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <ExecutiveMetrics />
        <AiExecutiveTeam />
        <BusinessWorkflow />
        <MissionControlPreview />
        <ExecutiveOutcomes />
        <IndustryUseCases />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
