import { useMemo, useRef, useState, type ElementType, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Receipt,
  FileText,
  BarChart3,
  Sparkles,
  CheckCircle2,
  Activity as ActivityIcon,
  Settings as SettingsIcon,
  PlusCircle,
  UserPlus,
  PackagePlus,
  ReceiptText,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchItem {
  label: string;
  description: string;
  path: string;
  icon: ElementType;
}

const SEARCH_INDEX: SearchItem[] = [
  { label: 'Mission Control', description: "Today's business snapshot", path: '/mission-control', icon: LayoutDashboard },
  { label: 'Customers', description: 'Manage your customers', path: '/customers', icon: Users },
  { label: 'Inventory', description: 'Products & stock levels', path: '/inventory', icon: Package },
  { label: 'Sales', description: 'Record and review sales', path: '/sales', icon: ShoppingCart },
  { label: 'Invoices', description: 'Generated invoices & trust status', path: '/invoices', icon: FileText },
  { label: 'Expenses', description: 'Track business expenses', path: '/expenses', icon: Receipt },
  { label: 'Reports', description: 'Revenue, profit & best sellers', path: '/reports', icon: BarChart3 },
  { label: 'AI COO Workspace', description: 'Ask about your business', path: '/ai-assistant', icon: Sparkles },
  { label: 'Approvals', description: 'Review pending agent actions', path: '/approvals', icon: CheckCircle2 },
  { label: 'Activity', description: 'Full agent action history', path: '/activity', icon: ActivityIcon },
  { label: 'Settings', description: 'Profile, security & preferences', path: '/settings', icon: SettingsIcon },
  { label: 'New sale', description: 'Record a sale', path: '/sales?new=1', icon: PlusCircle },
  { label: 'Add customer', description: 'Add a new customer', path: '/customers?new=1', icon: UserPlus },
  { label: 'Add product', description: 'Add a new product', path: '/inventory?new=1', icon: PackagePlus },
  { label: 'Log expense', description: 'Record a new expense', path: '/expenses?new=1', icon: ReceiptText },
];

export function GlobalSearch({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_INDEX.filter(
      (item) => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    ).slice(0, 7);
  }, [query]);

  const goTo = (item: SearchItem) => {
    navigate(item.path);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setQuery('');
      setOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Enter' && matches.length > 0) {
      goTo(matches[0]);
    }
  };

  return (
    <div className={`relative min-w-0 ${className || ''}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        placeholder="Search pages, customers, products, actions..."
        className="pl-9"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
      />
      {open && matches.length > 0 && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {matches.map((item) => (
            <button
              key={item.path}
              type="button"
              onMouseDown={() => goTo(item)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-secondary"
            >
              <item.icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{item.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
