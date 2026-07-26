import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  description: z.string().trim().optional().or(z.literal('')),
  sku: z.string().trim().optional().or(z.literal('')),
  barcode: z.string().trim().optional().or(z.literal('')),
  categoryId: z.string().optional().or(z.literal('')),
  costPrice: z.coerce.number({ invalid_type_error: 'Enter a valid number' }).min(0, 'Must be 0 or more'),
  sellingPrice: z.coerce.number({ invalid_type_error: 'Enter a valid number' }).min(0, 'Must be 0 or more'),
  stockQuantity: z.coerce.number({ invalid_type_error: 'Enter a valid number' }).int().min(0, 'Must be 0 or more'),
  lowStockThreshold: z.coerce.number({ invalid_type_error: 'Enter a valid number' }).int().min(0, 'Must be 0 or more'),
});

export type ProductFormValues = z.infer<typeof productSchema>;
