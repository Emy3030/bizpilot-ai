import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { CoPilotProvider } from '@/context/CoPilotContext';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/ProtectedRoute';
import { CoPilotPanel } from '@/components/ai/CoPilotPanel';

// Route-level code splitting — each page becomes its own chunk, loaded on
// demand instead of all bundled into one main.js. Keeps the first paint
// (landing page or login, for a logged-out visitor) fast regardless of how
// large Mission Control/Reports/etc. grow.
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const VerifyPage = lazy(() => import('@/pages/VerifyPage'));
const MissionControlPage = lazy(() => import('@/pages/MissionControlPage'));
const CustomersPage = lazy(() => import('@/pages/CustomersPage'));
const CustomerDetailPage = lazy(() => import('@/pages/CustomerDetailPage'));
const InventoryPage = lazy(() => import('@/pages/InventoryPage'));
const SalesPage = lazy(() => import('@/pages/SalesPage'));
const ExpensesPage = lazy(() => import('@/pages/ExpensesPage'));
const InvoicesPage = lazy(() => import('@/pages/InvoicesPage'));
const ApprovalsPage = lazy(() => import('@/pages/ApprovalsPage'));
const ActivityPage = lazy(() => import('@/pages/ActivityPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const AiAssistantPage = lazy(() => import('@/pages/AiAssistantPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function RouteFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <CoPilotProvider>
            <Toaster richColors position="top-right" />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <PublicOnlyRoute>
                      <LandingPage />
                    </PublicOnlyRoute>
                  }
                />

                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <LoginPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicOnlyRoute>
                      <RegisterPage />
                    </PublicOnlyRoute>
                  }
                />

                {/* Public — reached by scanning a receipt QR code, no login required */}
                <Route path="/verify/:hash" element={<VerifyPage />} />

                {/* Compatibility redirects — Mission Control absorbed Home's
                    intelligence feed and is now the single authenticated
                    entry point; old links/bookmarks to either still land
                    somewhere real. */}
                <Route path="/home" element={<Navigate to="/mission-control" replace />} />
                <Route path="/dashboard" element={<Navigate to="/mission-control" replace />} />
                <Route
                  path="/mission-control"
                  element={
                    <ProtectedRoute>
                      <MissionControlPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <CustomersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers/:id"
                  element={
                    <ProtectedRoute>
                      <CustomerDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute>
                      <InventoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sales"
                  element={
                    <ProtectedRoute>
                      <SalesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/expenses"
                  element={
                    <ProtectedRoute>
                      <ExpensesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/invoices"
                  element={
                    <ProtectedRoute>
                      <InvoicesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/approvals"
                  element={
                    <ProtectedRoute>
                      <ApprovalsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/activity"
                  element={
                    <ProtectedRoute>
                      <ActivityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-assistant"
                  element={
                    <ProtectedRoute>
                      <AiAssistantPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/mission-control" replace />} />
              </Routes>
            </Suspense>
            <CoPilotPanel />
            </CoPilotProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
