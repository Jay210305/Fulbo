import { z } from 'zod';

// Helper to transform null to undefined for compatibility with services
const nullToUndefined = <T>(val: T | null | undefined): T | undefined => 
  val === null ? undefined : val;

// ==================== REGISTER ====================

export const registerSchema = z.object({
  email: z
    .string({ error: 'El email es obligatorio' })
    .email('El email no tiene un formato válido'),
  password: z
    .string({ error: 'La contraseña es obligatoria' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  firstName: z
    .string({ error: 'El nombre es obligatorio' })
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  lastName: z
    .string({ error: 'El apellido es obligatorio' })
    .min(1, 'El apellido es obligatorio')
    .max(100, 'El apellido no puede exceder 100 caracteres'),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, 'Número de teléfono inválido')
    .optional()
    .nullable()
    .transform(nullToUndefined),
  documentType: z
    .enum(['dni', 'ce', 'passport'], 'Tipo de documento debe ser dni, ce o passport')
    .optional()
    .nullable()
    .transform(nullToUndefined),
  documentNumber: z
    .string()
    .min(8, 'El número de documento debe tener al menos 8 caracteres')
    .max(20, 'El número de documento no puede exceder 20 caracteres')
    .optional()
    .nullable()
    .transform(nullToUndefined),
  city: z.string().max(100).optional().nullable().transform(nullToUndefined),
  district: z.string().max(100).optional().nullable().transform(nullToUndefined),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ==================== LOGIN ====================

export const loginSchema = z.object({
  email: z
    .string({ error: 'El email es obligatorio' })
    .email('El email no tiene un formato válido'),
  password: z
    .string({ error: 'La contraseña es obligatoria' })
    .min(1, 'La contraseña es obligatoria'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ==================== SOCIAL LOGIN ====================

export const socialLoginSchema = z.object({
  email: z
    .string({ error: 'El email es obligatorio' })
    .email('El email no tiene un formato válido'),
  firstName: z
    .string({ error: 'El nombre es obligatorio' })
    .min(1, 'El nombre es obligatorio'),
  lastName: z
    .string({ error: 'El apellido es obligatorio' })
    .min(1, 'El apellido es obligatorio'),
  provider: z.enum(['google', 'facebook'], 'Proveedor debe ser google o facebook'),
  providerId: z
    .string({ error: 'El ID del proveedor es obligatorio' })
    .min(1, 'El ID del proveedor es obligatorio'),
  photoUrl: z.string().url('URL de foto inválida').optional().nullable().transform(nullToUndefined),
});

export type SocialLoginInput = z.infer<typeof socialLoginSchema>;
