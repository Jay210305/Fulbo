import { z } from 'zod';

// Helper to transform null to undefined for compatibility with services
const nullToUndefined = <T>(val: T | null | undefined): T | undefined => 
  val === null ? undefined : val;

// ==================== SCHEDULE BLOCK REASON ENUM ====================

export const scheduleBlockReasonEnum = z.enum(
  ['maintenance', 'personal', 'event'],
  'La razón debe ser "maintenance", "personal" o "event"'
);

// ==================== DATE HELPERS ====================

const dateStringSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Formato de fecha inválido' }
);

// ==================== CREATE SCHEDULE BLOCK ====================

export const createScheduleBlockSchema = z.object({
  fieldId: z.string().uuid('ID de cancha inválido'),
  startTime: dateStringSchema,
  endTime: dateStringSchema,
  reason: scheduleBlockReasonEnum,
  note: z.string().max(500).optional().nullable().transform(nullToUndefined),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['endTime'],
  }
);

export type CreateScheduleBlockInput = z.infer<typeof createScheduleBlockSchema>;

// ==================== PARAMS SCHEMAS ====================

export const blockIdParamSchema = z.object({
  id: z.string().uuid('ID de bloqueo inválido'),
});

export type BlockIdParam = z.infer<typeof blockIdParamSchema>;

export const fieldIdParamSchema = z.object({
  fieldId: z.string().uuid('ID de cancha inválido'),
});

export type FieldIdParam = z.infer<typeof fieldIdParamSchema>;

// ==================== QUERY SCHEMAS ====================

export const scheduleBlocksQuerySchema = z.object({
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
});

export type ScheduleBlocksQueryInput = z.infer<typeof scheduleBlocksQuerySchema>;
