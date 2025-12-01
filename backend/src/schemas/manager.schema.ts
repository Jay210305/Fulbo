import { z } from 'zod';

// Helper to transform null to undefined for compatibility with services
const nullToUndefined = <T>(val: T | null | undefined): T | undefined => 
  val === null ? undefined : val;

// ==================== COMMON SCHEMAS ====================

const uuidSchema = z.string().uuid('ID inválido');

const dateStringSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Formato de fecha inválido' }
);

// ==================== FIELD SCHEMAS ====================

export const createFieldSchema = z.object({
  name: z
    .string({ error: 'El nombre es obligatorio' })
    .min(1, 'El nombre es obligatorio')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  address: z
    .string({ error: 'La dirección es obligatoria' })
    .min(1, 'La dirección es obligatoria')
    .max(500, 'La dirección no puede exceder 500 caracteres'),
  description: z.string().max(2000).optional().nullable().transform(nullToUndefined),
  amenities: z.record(z.string(), z.unknown()).optional().nullable().transform(nullToUndefined),
  basePricePerHour: z
    .number({ error: 'El precio por hora es obligatorio' })
    .positive('El precio debe ser mayor a 0'),
});

export type CreateFieldInput = z.infer<typeof createFieldSchema>;

export const updateFieldSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional().nullable().transform(nullToUndefined),
  amenities: z.record(z.string(), z.unknown()).optional().nullable().transform(nullToUndefined),
  basePricePerHour: z.number().positive('El precio debe ser mayor a 0').optional(),
});

export type UpdateFieldInput = z.infer<typeof updateFieldSchema>;

// ==================== PROMOTION SCHEMAS ====================

export const discountTypeEnum = z.enum(
  ['percentage', 'fixed_amount'], 
  'Tipo de descuento debe ser "percentage" o "fixed_amount"'
);

export const createPromotionSchema = z.object({
  title: z
    .string({ error: 'El título es obligatorio' })
    .min(1, 'El título es obligatorio')
    .max(200, 'El título no puede exceder 200 caracteres'),
  description: z.string().max(1000).optional().nullable().transform(nullToUndefined),
  discountType: discountTypeEnum,
  discountValue: z
    .number({ error: 'El valor del descuento es obligatorio' })
    .positive('El valor del descuento debe ser mayor a 0'),
  startDate: dateStringSchema,
  endDate: dateStringSchema,
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: 'La fecha de fin debe ser posterior a la de inicio',
    path: ['endDate'],
  }
).refine(
  (data) => {
    if (data.discountType === 'percentage' && data.discountValue > 100) {
      return false;
    }
    return true;
  },
  {
    message: 'El porcentaje no puede ser mayor a 100',
    path: ['discountValue'],
  }
);

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;

export const updatePromotionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable().transform(nullToUndefined),
  discountType: discountTypeEnum.optional(),
  discountValue: z.number().positive('El valor del descuento debe ser mayor a 0').optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.discountType === 'percentage' && data.discountValue && data.discountValue > 100) {
      return false;
    }
    return true;
  },
  {
    message: 'El porcentaje no puede ser mayor a 100',
    path: ['discountValue'],
  }
);

export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;

// ==================== PRODUCT SCHEMAS ====================

export const productCategoryEnum = z.enum(
  ['bebida', 'snack', 'equipo', 'promocion'], 
  'Categoría debe ser "bebida", "snack", "equipo" o "promocion"'
);

export const createProductSchema = z.object({
  name: z
    .string({ error: 'El nombre es obligatorio' })
    .min(1, 'El nombre es obligatorio')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  description: z.string().max(1000).optional().nullable().transform(nullToUndefined),
  price: z
    .number({ error: 'El precio es obligatorio' })
    .positive('El precio debe ser mayor a 0'),
  imageUrl: z.string().url('URL de imagen inválida').optional().nullable().transform(nullToUndefined),
  category: productCategoryEnum,
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable().transform(nullToUndefined),
  price: z.number().positive('El precio debe ser mayor a 0').optional(),
  imageUrl: z.string().url('URL de imagen inválida').optional().nullable().transform(nullToUndefined),
  category: productCategoryEnum.optional(),
  isActive: z.boolean().optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const toggleActiveSchema = z.object({
  isActive: z.boolean({ error: 'isActive es obligatorio' }),
});

export type ToggleActiveInput = z.infer<typeof toggleActiveSchema>;

// ==================== BUSINESS PROFILE SCHEMAS ====================

export const updateBusinessProfileSchema = z.object({
  businessName: z.string().min(1).max(200).optional(),
  ruc: z.string().min(11).max(11, 'El RUC debe tener 11 dígitos').optional(),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
  settings: z.record(z.string(), z.unknown()).optional().nullable(),
});

export type UpdateBusinessProfileInput = z.infer<typeof updateBusinessProfileSchema>;

// ==================== PARAMS SCHEMAS ====================

export const idParamSchema = z.object({
  id: uuidSchema,
});

export type IdParam = z.infer<typeof idParamSchema>;

export const fieldIdParamSchema = z.object({
  fieldId: uuidSchema,
});

export type FieldIdParam = z.infer<typeof fieldIdParamSchema>;

// ==================== QUERY SCHEMAS ====================

export const bookingsQuerySchema = z.object({
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  fieldId: uuidSchema.optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
});

export type BookingsQueryInput = z.infer<typeof bookingsQuerySchema>;

export const statsQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'all']).optional().default('today'),
});

export type StatsQueryInput = z.infer<typeof statsQuerySchema>;

export const chartQuerySchema = z.object({
  days: z.coerce.number().min(1).max(30).optional().default(7),
});

export type ChartQueryInput = z.infer<typeof chartQuerySchema>;
