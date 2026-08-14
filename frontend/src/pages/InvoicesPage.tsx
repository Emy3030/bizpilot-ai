import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { PageTransition } from '@/components/motion/PageTransition';
import { FadeInSection } from '@/components/motion/FadeInSection';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';
import { useInvoices } from '@/hooks/useInvoices';
import { useAuth } from '@/context/AuthContext';

export default function InvoicesPage() {
  const { user } = useAuth();
  const currency = user?.currency || 'NGN';

  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError } = useInvoices({ page, limit: 20 });

  return (
    <AppLayout>
      <PageTransition>
        <SectionHeading
          title="Invoices"
          description={`${data?.meta.total ?? 0} invoice${data?.meta.total === 1 ? '' : 's'} · generated automatically from your sales, anchored on-chain for tamper-proof records`}
        />

        <FadeInSection delay={0.05}>
          {isError ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <p className="font-medium">Couldn't load invoices</p>
                <p className="text-sm text-muted-foreground">Check that the API server is running and try refreshing the page.</p>
              </CardContent>
            </Card>
          ) : (
            <InvoiceTable
              invoices={data?.data ?? []}
              meta={data?.meta}
              isLoading={isLoading || (isFetching && !data)}
              currency={currency}
              onPageChange={setPage}
            />
          )}
        </FadeInSection>
      </PageTransition>
    </AppLayout>
  );
}
