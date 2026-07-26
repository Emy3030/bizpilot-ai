import { useState } from 'react';
import { toast } from 'sonner';
import { FileText, Receipt as ReceiptIcon, Download, Loader2 } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProductThumbnail } from '@/components/ui/product-thumbnail';
import { ChainStatusAnimation } from '@/components/blockchain/ChainStatusAnimation';
import { useSale, useGenerateInvoice, useGenerateReceipt, useRecordPayment } from '@/hooks/useSales';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { getAssetUrl } from '@/utils/getAssetUrl';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function SaleDetailDialog({ saleId, onOpenChange }: { saleId: string | null; onOpenChange: (open: boolean) => void }) {
  const { user } = useAuth();
  const currency = user?.currency || 'NGN';
  const { data: sale, isLoading } = useSale(saleId || undefined);

  const generateInvoice = useGenerateInvoice();
  const generateReceipt = useGenerateReceipt();
  const recordPayment = useRecordPayment();
  const [paymentAmount, setPaymentAmount] = useState('');

  const handleGenerateInvoice = async () => {
    if (!saleId) return;
    try {
      await generateInvoice.mutateAsync(saleId);
      toast.success('Invoice generated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleGenerateReceipt = async () => {
    if (!saleId) return;
    try {
      await generateReceipt.mutateAsync(saleId);
      toast.success('Receipt generated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRecordPayment = async () => {
    if (!saleId) return;
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid payment amount');
      return;
    }
    try {
      await recordPayment.mutateAsync({ id: saleId, amount });
      toast.success('Payment recorded');
      setPaymentAmount('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={!!saleId} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sale details</DialogTitle>
          <DialogDescription>Items, payment status, and trust documents for this sale.</DialogDescription>
        </DialogHeader>

        {isLoading || !sale ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{sale.customer?.name || 'Walk-in customer'}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(sale.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <Badge
                variant={sale.paymentStatus === 'PAID' ? 'success' : sale.paymentStatus === 'PARTIAL' ? 'warning' : 'destructive'}
              >
                {sale.paymentStatus}
              </Badge>
            </div>

            <div className="space-y-2 rounded-lg border border-border p-3">
              {sale.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <ProductThumbnail imageUrl={item.product.imageUrl} name={item.product.name} size="sm" />
                    <span className="truncate">
                      {item.product.name} <span className="text-muted-foreground">×{item.quantity}</span>
                    </span>
                  </span>
                  <span className="shrink-0 font-medium">{formatCurrency(Number(item.subtotal), currency)}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm font-semibold">
                <span>Total</span>
                <span>{formatCurrency(Number(sale.totalAmount), currency)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Amount paid</span>
                <span>{formatCurrency(Number(sale.amountPaid), currency)}</span>
              </div>
              {Number(sale.amountPaid) < Number(sale.totalAmount) && (
                <div className="flex justify-between text-xs text-destructive">
                  <span>Balance due</span>
                  <span>{formatCurrency(Number(sale.totalAmount) - Number(sale.amountPaid), currency)}</span>
                </div>
              )}
            </div>

            {sale.paymentStatus !== 'PAID' && (
              <div className="space-y-2 rounded-lg border border-border p-3">
                <p className="text-sm font-medium">Record a payment</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                  <Button onClick={handleRecordPayment} isLoading={recordPayment.isPending}>
                    Add
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm font-medium">Trust documents</p>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  Invoice
                </div>
                {sale.invoice ? (
                  <a href={getAssetUrl(sale.invoice.pdfUrl) || '#'} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline">
                      <Download className="h-3.5 w-3.5" /> PDF
                    </Button>
                  </a>
                ) : (
                  <Button size="sm" onClick={handleGenerateInvoice} isLoading={generateInvoice.isPending}>
                    Generate
                  </Button>
                )}
              </div>
              {sale.invoice && (
                <ChainStatusAnimation status={sale.invoice.chainStatus} txHash={sale.invoice.txHash} compact />
              )}

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-sm">
                  <ReceiptIcon className="h-4 w-4 text-primary" />
                  Receipt {sale.receipt && <span className="text-xs text-muted-foreground">(with verification QR)</span>}
                </div>
                {sale.receipt ? (
                  <a href={getAssetUrl(sale.receipt.pdfUrl) || '#'} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline">
                      <Download className="h-3.5 w-3.5" /> PDF
                    </Button>
                  </a>
                ) : (
                  <Button size="sm" onClick={handleGenerateReceipt} isLoading={generateReceipt.isPending}>
                    Generate
                  </Button>
                )}
              </div>
              {sale.receipt && (
                <ChainStatusAnimation status={sale.receipt.chainStatus} txHash={sale.receipt.txHash} compact />
              )}

              {sale.receipt?.qrCodeUrl && (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-border p-4">
                  <img src={getAssetUrl(sale.receipt.qrCodeUrl) || ''} alt="Verification QR code" className="h-32 w-32" />
                  <p className="text-center text-xs text-muted-foreground">
                    Scan to verify this receipt's tamper-proof hash
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
