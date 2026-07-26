export interface ExpenseCategory {
  id: string;
  name: string;
  _count?: { expenses: number };
}

export interface Expense {
  id: string;
  title: string;
  amount: string | number;
  note: string | null;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  createdAt: string;
}

export interface ExpenseInput {
  title: string;
  amount: number;
  categoryId?: string;
  note?: string;
}

export interface ExpenseCategoryBreakdown {
  categoryId: string | null;
  categoryName: string;
  total: number;
}

export interface ExpenseSummary {
  today: { total: number; count: number };
  thisWeek: { total: number };
  thisMonth: { total: number };
  monthByCategory: ExpenseCategoryBreakdown[];
}
