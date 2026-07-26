import { useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Tags, AlertTriangle } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
import { PageTransition } from '@/components/motion/PageTransition';
import { FadeInSection } from '@/components/motion/FadeInSection';
import { ProductFormDialog } from '@/components/inventory/ProductFormDialog';
import { ProductTable } from '@/components/inventory/ProductTable';
import { CategoryManagerDialog } from '@/components/inventory/CategoryManagerDialog';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types/inventory';
import { cn } from '@/utils/cn';

export default function InventoryPage() {
  const { user } = useAuth();
  const currency = user?.currency || 'NGN';

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: categories } = useCategories();
  const { data, isLoading, isFetching } = useProducts({
    page,
    limit: 20,
    search: debouncedSearch,
    categoryId: categoryId || undefined,
    lowStockOnly,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingProduct(null);
      setFormOpen(true);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(value), 350);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  return (
    <AppLayout>
      <PageTransition>
        <SectionHeading
          title="Inventory"
          description={`${data?.meta.total ?? 0} product${data?.meta.total === 1 ? '' : 's'} total`}
          action={
            <>
              <Button variant="outline" onClick={() => setCategoryDialogOpen(true)}>
                <Tags className="h-4 w-4" /> Categories
              </Button>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add product
              </Button>
            </>
          }
        />

        <FadeInSection delay={0.05} className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU or barcode..."
              className="w-full pl-9 sm:w-72"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setLowStockOnly((v) => !v);
              setPage(1);
            }}
            className={cn(
              'flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors',
              lowStockOnly
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'border-input text-muted-foreground hover:bg-secondary'
            )}
          >
            <AlertTriangle className="h-4 w-4" />
            Low stock only
          </button>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <ProductTable
            products={data?.data ?? []}
            meta={data?.meta}
            isLoading={isLoading || (isFetching && !data)}
            currency={currency}
            onEdit={openEdit}
            onPageChange={setPage}
          />
        </FadeInSection>

        <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editingProduct} />
        <CategoryManagerDialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen} />
      </PageTransition>
    </AppLayout>
  );
}
