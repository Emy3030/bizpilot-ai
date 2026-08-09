import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Phone,
  Mail,
  MapPin,
  Wallet,
  TrendingUp,
  ShoppingBag,
  ShieldAlert,
  Sparkles,
  FileText,
  Receipt as ReceiptIcon,
  Download,
  Loader2,
} from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { CustomerFormDialog } from '@/components/customers/CustomerFormDialog';
import { PageTransition } from '@/components/motion/PageTransition';
import { FadeInSection } from '@/components/motion/FadeInSection';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer';
import { AnimatedCounter } from '@/components/motion/AnimatedCounter';
import { useCustomer } from '@/hooks/useCustomers';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatRelativeTime } from '@/utils/formatRelativeTime';
import { getAssetUrl } from '@/utils/getAssetUrl';
import { CustomerRiskLevel } from '@/types/customer';

const RISK_BADGE: Record<CustomerRiskLevel, 'success' | 'warning' | 'destructive'> = {
  Low: 'success',
  Medium: 'warning',
  High: 'destructive',
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const currency = user?.currency || 'NGN';
  const { data: customer, isLoading, isError } = useCustomer(id);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !customer) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
            <ShieldAlert className="h-8 w-8 text-destructive" />
            <p className="font-medium">Couldn't load this customer</p>
            <Link to="/customers" className="text-sm text-primary hover:underline">
              Back to Customers
            </Link>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const debt = Number(customer.outstandingDebt);

  return (
    <AppLayout>
      <PageTransition>
        <Link
          to="/customers"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Customers
        </Link>

        <FadeInSection>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">{customer.name}</h1>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {customer.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {customer.phone}
                  </span>
                )}
                {customer.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {customer.email}
                  </span>
                )}
                {customer.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {customer.address}
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </div>
        </FadeInSection>

        <StaggerContainer className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StaggerItem>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-success" /> Lifetime value
                </div>
                <p className="font-display mt-1.5 text-xl font-bold">
                  <AnimatedCounter value={customer.lifetimeValue} format={(n) => formatCurrency(n, currency)} />
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Wallet className="h-3.5 w-3.5 text-amber-500" /> Outstanding debt
                </div>
                <p className="font-display mt-1.5 text-xl font-bold">
                  <AnimatedCounter value={debt} format={(n) => formatCurrency(n, currency)} />
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <ShoppingBag className="h-3.5 w-3.5 text-primary" /> Total orders
                </div>
                <p className="font-display mt-1.5 text-xl font-bold">
                  <AnimatedCounter value={customer.totalOrders} />
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <ShieldAlert className="h-3.5 w-3.5" /> Risk level
                </div>
                <div className="mt-2">
                  <Badge variant={RISK_BADGE[customer.riskLevel]}>{customer.riskLevel}</Badge>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <FadeInSection delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Purchase history</CardTitle>
                  <CardDescription>
                    {customer.daysSinceLastPurchase === null
                      ? 'No purchases yet'
                      : `Last purchase ${customer.daysSinceLastPurchase === 0 ? 'today' : `${customer.daysSinceLastPurchase} days ago`}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {customer.sales.length === 0 ? (
                    <EmptyState icon={ShoppingBag} title="No sales yet" compact />
                  ) : (
                    <div className="space-y-4">
                      {customer.sales.map((sale) => (
                        <div key={sale.id} className="rounded-xl border border-border p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">
                                {sale.items.map((i) => i.product.name).join(', ')}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatRelativeTime(sale.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">{formatCurrency(Number(sale.totalAmount), currency)}</p>
                              <Badge
                                variant={
                                  sale.paymentStatus === 'PAID'
                                    ? 'success'
                                    : sale.paymentStatus === 'PARTIAL'
                                      ? 'warning'
                                      : 'destructive'
                                }
                                className="mt-1"
                              >
                                {sale.paymentStatus}
                              </Badge>
                            </div>
                          </div>

                          {(sale.invoice || sale.receipt) && (
                            <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
                              {sale.invoice && (
                                <a href={getAssetUrl(sale.invoice.pdfUrl) || '#'} target="_blank" rel="noreferrer">
                                  <Button size="sm" variant="outline">
                                    <FileText className="h-3.5 w-3.5" /> Invoice <Download className="h-3 w-3" />
                                  </Button>
                                </a>
                              )}
                              {sale.receipt && (
                                <a href={getAssetUrl(sale.receipt.pdfUrl) || '#'} target="_blank" rel="noreferrer">
                                  <Button size="sm" variant="outline">
                                    <ReceiptIcon className="h-3.5 w-3.5" /> Receipt <Download className="h-3 w-3" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInSection>
          </div>

          <FadeInSection delay={0.15}>
            <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Insights
                </CardTitle>
                <CardDescription>What this customer's history suggests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {customer.recommendations.map((rec, i) => (
                  <p key={i} className="rounded-lg bg-card/60 p-3 text-sm leading-relaxed text-foreground/90">
                    {rec}
                  </p>
                ))}
              </CardContent>
            </Card>
          </FadeInSection>
        </div>

        <CustomerFormDialog open={editOpen} onOpenChange={setEditOpen} customer={customer} />
      </PageTransition>
    </AppLayout>
  );
}
