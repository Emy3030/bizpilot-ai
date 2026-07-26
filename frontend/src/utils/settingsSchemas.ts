import { z } from 'zod';

export const profileSchema = z.object({
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters'),
  name: z.string().trim().min(2, 'Your name must be at least 2 characters'),
  currency: z.string().trim().length(3, 'Currency must be a 3-letter code (e.g. NGN, USD)').toUpperCase(),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/\d/, 'New password must contain at least one number'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ['confirmNewPassword'],
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;
