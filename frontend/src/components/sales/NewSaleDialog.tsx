import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Minus, Plus, Search, ShoppingCart, Trash2, UserPlus, Check } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateSale } from '@/hooks/useSales';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { PaymentMethod } from '@/types/sale';
import { Customer } from '@/types/customer';

interface CartLine {
  productId: string;
  name: string;
  unitPrice: number;
  availableStock: number;
  quantity: number;
}

const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'TRANSFER', 'CARD', 'CREDIT'];

export function NewSaleDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user } = useAuth();
  const currency = user?.currency || 'NGN';

  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [amountPaid, setAmountPaid] = useState<string>('');

  // Customer: type a name — matches an existing customer show as suggestions
  // to pick from, or just keep typing and a brand-new customer is created
  // automatically when the sale is recorded. No separate trip to the
  // Customers page required.
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  const { data: productsData } = useProducts({ page: 1, limit: 10, search: productSearch });
  const { data: customersData } = useCustomers({ page: 1, limit: 100 });
  const createSale = useCreateSale();

  const total = useMemo(
    () => cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [cart]
  );

  const customerMatches = useMemo(() => {
    const query = customerName.trim().toLowerCase();
    if (!query) return [];
    return (customersData?.data ?? []).filter((c) => c.name.toLowerCase().includes(query)).slice(0, 5);
  }, [customerName, customersData]);

  const handleCustomerNameChange = (value: string) => {
    setCustomerName(value);
    setSelectedCustomerId('');
    setShowCustomerSuggestions(true);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone || '');
    setCustomerAddress(customer.address || '');
    setShowCustomerSuggestions(false);
  };

  const addToCart = (product: { id: string; name: string; sellingPrice: string | number; stockQuantity: number }) => {
    if (product.stockQuantity <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          toast.error('Not enough stock available');
          return prev;
        }
        return prev.map((l) => (l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: Number(product.sellingPrice),
          availableStock: product.stockQuantity,
          quantity: 1,
        },
      ];
    });
  };

  const changeQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.productId !== productId) return l;
          const nextQty = l.quantity + delta;
          if (nextQty > l.availableStock) {
            toast.error('Not enough stock available');
            return l;
          }
          return { ...l, quantity: nextQty };
        })
        .filter((l) => l.quantity > 0)
    );
  };

  const removeLine = (productId: string) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  };

  const resetForm = () => {
    setCart([]);
    setPaymentMethod('CASH');
    setAmountPaid('');
    setProductSearch('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setSelectedCustomerId('');
    setShowCustomerSuggestions(false);
  };

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error('Add at least one product to the sale');
      return;
    }
    const paid = amountPaid === '' ? total : Number(amountPaid);
    if (Number.isNaN(paid) || paid < 0) {
      toast.error('Enter a valid amount paid');
      return;
    }

    const trimmedName = customerName.trim();

    try {
      await createSale.mutateAsync({
        customerId: selectedCustomerId || undefined,
        customerName: !selectedCustomerId && trimmedName ? trimmedName : undefined,
        customerPhone: !selectedCustomerId && trimmedName ? customerPhone.trim() || undefined : undefined,
        customerAddress: !selectedCustomerId && trimmedName ? customerAddress.trim() || undefined : undefined,
        paymentMethod,
        amountPaid: paid,
        items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      });
      toast.success(
        !selectedCustomerId && trimmedName ? `Sale recorded — ${trimmedName} added to your customers` : 'Sale recorded'
      );
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New sale</DialogTitle>
          <DialogDescription>Search for products, build the cart, then record payment.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Add products</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
          </div>
          {productSearch && (
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border">
              {productsData?.data.length ? (
                productsData.data.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addToCart(p)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-secondary"
                  >
                    <span>{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(Number(p.sellingPrice), currency)} · {p.stockQuantity} in stock
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-3 text-sm text-muted-foreground">No products match "{productSearch}"</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Cart</Label>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              <ShoppingCart className="h-6 w-6 opacity-40" />
              No items yet — search above to add products.
            </div>
          ) : (
            <div className="space-y-2 rounded-lg border border-border p-2">
              {cart.map((line) => (
                <div key={line.productId} className="space-y-1.5 rounded-md px-2 py-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm font-medium">{line.name}</p>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => removeLine(line.productId)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">{formatCurrency(line.unitPrice, currency)} each</p>
                    <div className="flex items-center gap-1.5">
                      <Button type="button" size="icon" variant="outline" className="h-7 w-7" onClick={() => changeQuantity(line.productId, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{line.quantity}</span>
                      <Button type="button" size="icon" variant="outline" className="h-7 w-7" onClick={() => changeQuantity(line.productId, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <p className="w-16 text-right text-sm font-medium sm:w-20">
                        {formatCurrency(line.unitPrice * line.quantity, currency)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerName">Customer</Label>
          <div className="relative">
            <Input
              id="customerName"
              placeholder="Type a name — new or existing"
              value={customerName}
              onChange={(e) => handleCustomerNameChange(e.target.value)}
              onFocus={() => setShowCustomerSuggestions(true)}
              onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 150)}
              autoComplete="off"
            />
            {selectedCustomerId && (
              <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-success" />
            )}
            {showCustomerSuggestions && customerMatches.length > 0 && (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                {customerMatches.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onMouseDown={() => handleSelectCustomer(c)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-secondary"
                  >
                    <span>{c.name}</span>
                    {c.phone && <span className="text-xs text-muted-foreground">{c.phone}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {selectedCustomerId ? (
              <>
                <Check className="h-3 w-3 text-success" /> Existing customer selected
              </>
            ) : customerName.trim() ? (
              <>
                <UserPlus className="h-3 w-3" /> New customer — will be added to your Customers list automatically
              </>
            ) : (
              'Leave blank for a walk-in sale'
            )}
          </p>
        </div>

        {!selectedCustomerId && customerName.trim() && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone (optional)</Label>
              <Input
                id="customerPhone"
                placeholder="080..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Address (optional)</Label>
              <Input
                id="customerAddress"
                placeholder="Delivery / billing address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment method</Label>
          <select
            id="paymentMethod"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amountPaid">Amount paid</Label>
          <Input
            id="amountPaid"
            type="number"
            min="0"
            step="0.01"
            placeholder={`Full amount (${formatCurrency(total, currency)}) if left blank`}
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Leave blank to mark as fully paid. Enter less than the total to record a partial payment.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-secondary/60 px-4 py-3">
          <span className="text-sm font-medium">Total</span>
          <span className="text-lg font-bold">{formatCurrency(total, currency)}</span>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} isLoading={createSale.isPending}>
            Record sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
