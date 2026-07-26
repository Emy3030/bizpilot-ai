import { useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
import { PageTransition } from '@/components/motion/PageTransition';
import { FadeInSection } from '@/components/motion/FadeInSection';
import { CustomerFormDialog } from '@/components/customers/CustomerFormDialog';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuth } from '@/context/AuthContext';
import { Customer } from '@/types/customer';

export default function CustomersPage() {
  const { user } = useAuth();
  const currency = user?.currency || 'NGN';

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { data, isLoading, isFetching } = useCustomers({ page, limit: 20, search: debouncedSearch });

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingCustomer(null);
      setFormOpen(true);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(value), 350);
  };

  const openCreate = () => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  return (
    <AppLayout>
      <PageTransition>
        <SectionHeading
          title="Customers"
          description={`${data?.meta.total ?? 0} customer${data?.meta.total === 1 ? '' : 's'} total`}
          action={
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="w-full pl-9 sm:w-64"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add customer
              </Button>
            </>
          }
        />

        <FadeInSection delay={0.05}>
          <CustomerTable
            customers={data?.data ?? []}
            meta={data?.meta}
            isLoading={isLoading || (isFetching && !data)}
            currency={currency}
            onEdit={openEdit}
            onPageChange={setPage}
          />
        </FadeInSection>

        <CustomerFormDialog open={formOpen} onOpenChange={setFormOpen} customer={editingCustomer} />
      </PageTransition>
    </AppLayout>
  );
}
