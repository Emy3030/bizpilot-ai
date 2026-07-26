import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  phone: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  address: z.string().trim().optional().or(z.literal('')),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
