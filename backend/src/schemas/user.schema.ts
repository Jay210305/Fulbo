import { z } from 'zod';

// ==================== UPDATE PROFILE ====================

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ==================== VERIFY PHONE ====================

export const verifyPhoneSchema = z.object({
  phone: z
    .string({ error: 'El teléfono es obligatorio' })
    .regex(/^\+?[0-9]{9,15}$/, 'Número de teléfono inválido'),
  code: z
    .string({ error: 'El código es obligatorio' })
    .length(6, 'El código debe tener 6 dígitos'),
});

export type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>;
