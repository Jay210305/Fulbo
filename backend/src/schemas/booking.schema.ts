import { z } from 'zod';

// ==================== COMMON SCHEMAS ====================

// UUID validation for IDs
const uuidSchema = z.string().uuid('ID inválido');

// Date string that can be parsed - accepts ISO strings
const dateStringSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Formato de fecha inválido' }
);

// Phone number validation (optional)
const phoneSchema = z.string()
  .min(6, 'El teléfono debe tener al menos 6 caracteres')
  .max(20, 'El teléfono no puede exceder 20 caracteres')
  .optional();

// ==================== CREATE BOOKING ====================

export const createBookingSchema = z.object({
  fieldId: uuidSchema.describe('ID de la cancha'),
  startTime: dateStringSchema.describe('Hora de inicio (ISO string)'),
  endTime: dateStringSchema.describe('Hora de fin (ISO string)'),
  // totalPrice is now optional - backend calculates the real price for security
  totalPrice: z
    .number()
    .positive('El precio debe ser mayor a 0')
    .optional(),
  paymentMethod: z.string().optional(),
  matchName: z.string().max(100).optional(),
  // Guest booking fields (for manager walk-in/phone reservations)
  guestName: z.string().max(255).optional(),
  guestPhone: phoneSchema,
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['endTime'],
  }
).refine(
  // If guestName is provided, guestPhone is recommended but paymentMethod can be optional
  (data) => {
    // No strict validation needed - just allowing the combination
    return true;
  },
  {
    message: 'Validación de reserva de invitado',
  }
);

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// ==================== RESCHEDULE BOOKING ====================

export const rescheduleBookingSchema = z.object({
  newStartTime: dateStringSchema.describe('Nueva hora de inicio (ISO string)'),
  newEndTime: dateStringSchema.describe('Nueva hora de fin (ISO string)'),
}).refine(
  (data) => new Date(data.newEndTime) > new Date(data.newStartTime),
  {
    message: 'La nueva hora de fin debe ser posterior a la hora de inicio',
    path: ['newEndTime'],
  }
);

export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;

// ==================== PARAMS SCHEMAS ====================

export const bookingIdParamSchema = z.object({
  bookingId: uuidSchema.describe('ID de la reserva'),
});

export type BookingIdParam = z.infer<typeof bookingIdParamSchema>;

export const fieldIdParamSchema = z.object({
  fieldId: uuidSchema.describe('ID de la cancha'),
});

export type FieldIdParam = z.infer<typeof fieldIdParamSchema>;

// ==================== QUERY SCHEMAS ====================

export const fieldBookingsQuerySchema = z.object({
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
});

export type FieldBookingsQuery = z.infer<typeof fieldBookingsQuerySchema>;
