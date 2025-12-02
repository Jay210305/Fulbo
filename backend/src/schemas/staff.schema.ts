import { z } from 'zod';

// Helper to transform null to undefined for compatibility with services
const nullToUndefined = <T>(val: T | null | undefined): T | undefined => 
  val === null ? undefined : val;

// ==================== STAFF ROLE ENUM ====================

export const staffRoleEnum = z.enum(
  ['encargado', 'administrador', 'recepcionista', 'mantenimiento'],
  'Rol debe ser "encargado", "administrador", "recepcionista" o "mantenimiento"'
);

// ==================== CREATE STAFF ====================

export const createStaffSchema = z.object({
  name: z
    .string({ error: 'El nombre es obligatorio' })
    .min(1, 'El nombre es obligatorio')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  email: z
    .string({ error: 'El email es obligatorio' })
    .email('El email no tiene un formato válido'),
  phone: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, 'Número de teléfono inválido')
    .optional()
    .nullable()
    .transform(nullToUndefined),
  role: staffRoleEnum.optional().default('encargado'),
  permissions: z.record(z.string(), z.boolean()).optional().nullable().transform(nullToUndefined),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;

// ==================== UPDATE STAFF ====================

export const updateStaffSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email('El email no tiene un formato válido').optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, 'Número de teléfono inválido')
    .optional()
    .nullable()
    .transform(nullToUndefined),
  role: staffRoleEnum.optional(),
  permissions: z.record(z.string(), z.boolean()).optional().nullable().transform(nullToUndefined),
  isActive: z.boolean().optional(),
});

export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;

// ==================== TOGGLE ACTIVE ====================

export const toggleActiveSchema = z.object({
  isActive: z.boolean({ error: 'isActive es obligatorio' }),
});

export type ToggleActiveInput = z.infer<typeof toggleActiveSchema>;

// ==================== PARAMS SCHEMAS ====================

export const staffIdParamSchema = z.object({
  id: z.string().uuid('ID de personal inválido'),
});

export type StaffIdParam = z.infer<typeof staffIdParamSchema>;
