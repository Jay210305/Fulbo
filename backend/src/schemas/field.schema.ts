import { z } from 'zod';

// ==================== SEARCH QUERY ====================

export const searchQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

// ==================== FIELD ID PARAM ====================

export const fieldIdParamSchema = z.object({
  id: z.string().uuid('ID de cancha inválido'),
});

export type FieldIdParam = z.infer<typeof fieldIdParamSchema>;

// ==================== AVAILABILITY QUERY ====================

export const availabilityQuerySchema = z.object({
  startDate: z.coerce.date({ error: 'startDate es requerido y debe ser una fecha válida' }),
  endDate: z.coerce.date({ error: 'endDate es requerido y debe ser una fecha válida' }),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'endDate debe ser posterior a startDate',
    path: ['endDate'],
  }
);

export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>;
