import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, AlertTriangle } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { PageTransition } from '@/components/motion/PageTransition';
import { FadeInSection } from '@/components/motion/FadeInSection';
import { NewSaleDialog } from '@/components/sales/NewSaleDialog';
import { SaleDetailDialog } from '@/components/sales/SaleDetailDialog';
import { SalesTable } from '@/components/sales/SalesTable';
import { SalesAgentBanner } from '@/components/sales/SalesAgentBanner';
import { useSales } from '@/hooks/useSales';
import { useAuth } from '@/context/AuthContext';
import { PaymentStatus } from '@/types/sale';
import { cn } from '@/utils/cn';

const STATUS_FILTERS: { label: string; value: PaymentStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Partial', value: 'PARTIAL' },
  { label: 'Unpaid', value: 'UNPAID' },
];

export default function SalesPage() {
  const { user } = useAuth();
  const currency = user?.currency || 'NGN';

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [viewingSaleId, setViewingSaleId] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError } = useSales({
    page,
    limit: 20,
    paymentStatus: statusFilter || undefined,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setNewSaleOpen(true);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppLayout>
      <PageTransition>
        <SectionHeading
          title="Sales"
          description={`${data?.meta.total ?? 0} sale${data?.meta.total === 1 ? '' : 's'} total`}
          action={
            <Button onClick={() => setNewSaleOpen(true)}>
              <Plus className="h-4 w-4" /> New sale
            </Button>
          }
        />

        <FadeInSection delay={0.05} className="mb-4">
          <SalesAgentBanner />
        </FadeInSection>

        <FadeInSection delay={0.08} className="mb-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => {
                setStatusFilter(f.value);
                setPage(1);
              }}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === f.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input text-muted-foreground hover:bg-secondary'
              )}
            >
              {f.label}
            </button>
          ))}
        </FadeInSection>

        <FadeInSection delay={0.1}>
          {isError ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <p className="font-medium">Couldn't load sales</p>
                <p className="text-sm text-muted-foreground">Check that the API server is running and try refreshing the page.</p>
              </CardContent>
            </Card>
          ) : (
            <SalesTable
              sales={data?.data ?? []}
              meta={data?.meta}
              isLoading={isLoading || (isFetching && !data)}
              currency={currency}
              onView={setViewingSaleId}
              onPageChange={setPage}
            />
          )}
        </FadeInSection>

        <NewSaleDialog open={newSaleOpen} onOpenChange={setNewSaleOpen} />
        <SaleDetailDialog saleId={viewingSaleId} onOpenChange={(open) => !open && setViewingSaleId(null)} />
      </PageTransition>
    </AppLayout>
  );
}
