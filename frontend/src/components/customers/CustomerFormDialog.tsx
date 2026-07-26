import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

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
import { customerSchema, CustomerFormValues } from '@/utils/customerSchemas';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomers';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Customer } from '@/types/customer';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

export function CustomerFormDialog({ open, onOpenChange, customer }: Props) {
  const isEditing = !!customer;
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', phone: '', email: '', address: '' },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: customer?.name || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        address: customer?.address || '',
      });
    }
  }, [open, customer, reset]);

  const onSubmit = async (values: CustomerFormValues) => {
    const payload = {
      name: values.name,
      phone: values.phone || undefined,
      email: values.email || undefined,
      address: values.address || undefined,
    };

    try {
      if (isEditing && customer) {
        await updateCustomer.mutateAsync({ id: customer.id, payload });
        toast.success('Customer updated');
      } else {
        await createCustomer.mutateAsync(payload);
        toast.success('Customer added');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit customer' : 'Add customer'}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update this customer's details." : 'Add a new customer to your business.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Full name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="080..." {...register('phone')} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="optional" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" placeholder="optional" {...register('address')} />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEditing ? 'Save changes' : 'Add customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
