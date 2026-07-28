import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home as HomeIcon,
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Receipt,
  BarChart3,
  Sparkles,
  Settings as SettingsIcon,
  Moon,
  Sun,
  LogOut,
  Rocket,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { cn } from '@/utils/cn';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  comingSoon?: boolean;
}

// Main nav group — Home through AI Assistant.
const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: HomeIcon, path: '/home' },
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Customers', icon: Users, path: '/customers' },
  { label: 'Inventory', icon: Package, path: '/inventory' },
  { label: 'Sales', icon: ShoppingCart, path: '/sales' },
  { label: 'Expenses', icon: Receipt, path: '/expenses' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'AI Assistant', icon: Sparkles, path: '/ai-assistant' },
];

// Settings sits in its own group at the bottom, next to the account panel —
// kept separate on purpose so there's visible breathing room between "the
// app's pages" and "account-level stuff."
const SETTINGS_ITEM: NavItem = { label: 'Settings', icon: SettingsIcon, path: '/settings' };

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

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar — permanently visible at lg and above */}
      <aside className="hidden h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-card/40 p-4 lg:flex">
        <Link to="/home" className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Rocket className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">BizPilot AI</span>
        </Link>

        <NavLinks variant="desktop" />

        {/* mt-auto pushes this whole group to the bottom, leaving a gap
            above it whenever the main nav doesn't fill the sidebar height */}
        <div className="mt-auto flex flex-col gap-3 pt-6">
          <NavItemLink item={SETTINGS_ITEM} variant="desktop" />
          <div className="rounded-xl border border-border bg-secondary/50 p-3">
            <p className="truncate text-sm font-medium">{user?.businessName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
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
              <Link to="/home" className="flex items-center gap-2" onClick={() => setMobileNavOpen(false)}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Rocket className="h-4 w-4" />
                </div>
                <span className="font-display text-lg font-bold tracking-tight">BizPilot AI</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <NavLinks variant="mobile" onNavigate={() => setMobileNavOpen(false)} />

            <div className="mt-auto flex flex-col gap-3 pt-6">
              <NavItemLink item={SETTINGS_ITEM} variant="mobile" onNavigate={() => setMobileNavOpen(false)} />
              <div className="rounded-xl border border-border bg-secondary/50 p-3">
                <p className="truncate text-sm font-medium">{user?.businessName}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
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
            to="/home"
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
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" onClick={logout} className="hidden sm:inline-flex">
              <LogOut className="h-4 w-4" /> Log out
            </Button>
            <Button variant="outline" size="icon" onClick={logout} className="sm:hidden">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
