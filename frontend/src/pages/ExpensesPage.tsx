import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Tags } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { PageTransition } from '@/components/motion/PageTransition';
import { FadeInSection } from '@/components/motion/FadeInSection';
import { ExpenseFormDialog } from '@/components/expenses/ExpenseFormDialog';
import { ExpenseTable } from '@/components/expenses/ExpenseTable';
import { ExpenseCategoryManagerDialog } from '@/components/expenses/ExpenseCategoryManagerDialog';
import { ExpenseSummaryCards } from '@/components/expenses/ExpenseSummaryCards';
import { useExpenses, useExpenseSummary } from '@/hooks/useExpenses';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useAuth } from '@/context/AuthContext';
import { Expense } from '@/types/expense';

export default function ExpensesPage() {
  const { user } = useAuth();
  const currency = user?.currency || 'NGN';

  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const { data: categories } = useExpenseCategories();
  const { data: summary, isLoading: summaryLoading } = useExpenseSummary();
  const { data, isLoading, isFetching } = useExpenses({
    page,
    limit: 20,
    categoryId: categoryId || undefined,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingExpense(null);
      setFormOpen(true);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingExpense(null);
    setFormOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };

  return (
    <AppLayout>
      <PageTransition>
        <SectionHeading
          title="Expenses"
          description={`${data?.meta.total ?? 0} expense${data?.meta.total === 1 ? '' : 's'} total`}
          action={
            <>
              <Button variant="outline" onClick={() => setCategoryDialogOpen(true)}>
                <Tags className="h-4 w-4" /> Categories
              </Button>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Log expense
              </Button>
            </>
          }
        />

        {!summaryLoading && summary && (
          <FadeInSection delay={0.05} className="mb-6">
            <ExpenseSummaryCards summary={summary} currency={currency} />
          </FadeInSection>
        )}

        <FadeInSection delay={0.1} className="mb-4">
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
        </FadeInSection>

        <FadeInSection delay={0.15}>
          <ExpenseTable
            expenses={data?.data ?? []}
            meta={data?.meta}
            isLoading={isLoading || (isFetching && !data)}
            currency={currency}
            onEdit={openEdit}
            onPageChange={setPage}
          />
        </FadeInSection>

        <ExpenseFormDialog open={formOpen} onOpenChange={setFormOpen} expense={editingExpense} />
        <ExpenseCategoryManagerDialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen} />
      </PageTransition>
    </AppLayout>
  );
}
