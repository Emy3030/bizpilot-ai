import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
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
  Moon,
  Sun,
  LogOut,
  Rocket,
  Menu,
  X,
  Bell,
  ChevronsUpDown,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useCoPilot } from '@/context/CoPilotContext';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { usePendingAgentActions } from '@/hooks/useAgentActions';
import { formatRelativeTime } from '@/utils/formatRelativeTime';
import { cn } from '@/utils/cn';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  comingSoon?: boolean;
}

// Main nav group — Mission Control is the authenticated entry point; Home's
// intelligence feed now lives inside it, so Home has no nav entry of its own.
const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Mission Control', icon: LayoutDashboard, path: '/mission-control' },
  { label: 'AI COO Workspace', icon: Sparkles, path: '/ai-assistant' },
  { label: 'Customers', icon: Users, path: '/customers' },
  { label: 'Inventory', icon: Package, path: '/inventory' },
  { label: 'Sales', icon: ShoppingCart, path: '/sales' },
  { label: 'Invoices', icon: FileText, path: '/invoices' },
  { label: 'Expenses', icon: Receipt, path: '/expenses' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'Approvals', icon: CheckCircle2, path: '/approvals' },
  { label: 'Activity', icon: ActivityIcon, path: '/activity' },
];

function NavItemLink({
  item,
  variant,
  onNavigate,
}: {
  item: NavItem;
  variant: 'desktop' | 'mobile';
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const isActive = location.pathname === item.path;

  if (item.comingSoon) {
    return (
      <button
        disabled
        title="Coming in a future module"
        className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground opacity-50"
      >
        <span className="flex items-center gap-3">
          <item.icon className="h-4 w-4" />
          {item.label}
        </span>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">soon</span>
      </button>
    );
  }

  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      className={cn(
        'relative flex items-center gap-3 rounded-lg px-3 py-2 pl-4 text-sm font-medium transition-colors',
        isActive ? 'text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      )}
    >
      {isActive && (
        <motion.span
          layoutId={`active-nav-indicator-${variant}`}
          className="absolute inset-0 rounded-lg bg-primary/10"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
      {isActive && (
        <motion.span
          layoutId={`active-nav-bar-${variant}`}
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
      <span className="relative flex items-center gap-3">
        <item.icon className="h-4 w-4" />
        {item.label}
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate, variant }: { onNavigate?: () => void; variant: 'desktop' | 'mobile' }) {
  return (
    <nav className="flex flex-col gap-1">
      {MAIN_NAV_ITEMS.map((item) => (
        <NavItemLink key={item.label} item={item} variant={variant} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

function NotificationBell() {
  const navigate = useNavigate();
  const { data: pending } = usePendingAgentActions();
  const count = pending?.length ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Pending approvals</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {count === 0 ? (
          <EmptyState icon={Clock} title="Nothing waiting on you" compact />
        ) : (
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {pending!.slice(0, 6).map((action) => (
              <DropdownMenuItem key={action.id} onClick={() => navigate('/approvals')} className="flex-col items-start gap-0.5">
                <span className="truncate text-sm font-medium">{action.summary}</span>
                <span className="text-xs text-muted-foreground">{formatRelativeTime(action.createdAt)}</span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        {count > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/approvals')} className="justify-center text-primary">
              Review all approvals
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({ variant }: { variant: 'desktop' | 'mobile' }) {
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex w-full items-center gap-2 rounded-xl border border-border bg-secondary/50 p-3 text-left transition-colors hover:bg-secondary"
          aria-label="Account menu"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.businessName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side={variant === 'desktop' ? 'top' : 'bottom'} className="w-56">
        <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <SettingsIcon className="h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onClick={logout}>
          <LogOut className="h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggle } = useCoPilot();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  // On the full AI COO Workspace page, "Ask AI COO" would just open a second
  // copy of the same conversation already on screen — show a plain
  // indicator there instead of a second entry point into it.
  const isOnWorkspace = location.pathname === '/ai-assistant';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar — permanently visible at lg and above */}
      <aside className="hidden h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-card/40 p-4 lg:flex">
        <Link to="/mission-control" className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Rocket className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">BizPilot</span>
        </Link>

        <NavLinks variant="desktop" />

        {/* mt-auto pushes this whole group to the bottom, leaving a gap
            above it whenever the main nav doesn't fill the sidebar height */}
        <div className="mt-auto pt-6">
          <UserMenu variant="desktop" />
        </div>
      </aside>

      {/* Mobile / tablet nav drawer — hidden until the hamburger is tapped */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-card p-4 shadow-xl">
            <div className="mb-8 flex items-center justify-between px-2">
              <Link to="/mission-control" className="flex items-center gap-2" onClick={() => setMobileNavOpen(false)}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Rocket className="h-4 w-4" />
                </div>
                <span className="font-display text-lg font-bold tracking-tight">BizPilot</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <NavLinks variant="mobile" onNavigate={() => setMobileNavOpen(false)} />

            <div className="mt-auto pt-6">
              <UserMenu variant="mobile" />
            </div>
          </aside>
        </div>
      )}

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <Link
            to="/mission-control"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 lg:hidden"
          >
            <Rocket className="h-4 w-4" />
          </Link>

          <div className="hidden min-w-0 shrink-0 lg:block">
            <h1 className="font-display truncate text-base font-semibold">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="truncate text-xs text-muted-foreground">{user?.businessName}</p>
          </div>

          <GlobalSearch className="min-w-0 flex-1 lg:max-w-md" />

          <div className="flex shrink-0 items-center gap-2">
            {isOnWorkspace ? (
              <div className="hidden items-center gap-2 rounded-lg border border-primary/20 bg-primary/[0.06] px-3 py-2 text-xs font-medium text-primary sm:flex">
                <Sparkles className="h-4 w-4" /> You're in the AI COO Workspace
              </div>
            ) : (
              <>
                <Button className="hidden sm:inline-flex" onClick={toggle}>
                  <Sparkles className="h-4 w-4" /> Ask AI COO
                </Button>
                <Button variant="outline" size="icon" className="sm:hidden" onClick={toggle} aria-label="Ask AI COO">
                  <Sparkles className="h-4 w-4" />
                </Button>
              </>
            )}
            <NotificationBell />
            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
