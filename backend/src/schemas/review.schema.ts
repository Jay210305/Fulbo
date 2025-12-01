import { z } from 'zod';

// ==================== COMMON SCHEMAS ====================

// UUID validation for IDs
const uuidSchema = z.string().uuid('ID inválido');

// ==================== CREATE REVIEW ====================

// Predefined valid tags (InDrive-style badges)
export const VALID_REVIEW_TAGS = [
  'Buena Iluminación',
  'Cancha Nivelada',
  'Estacionamiento Seguro',
  'Vestuarios Limpios',
  'Buen Césped',
  'Puntualidad',
  'Personal Amable',
  'Fácil Acceso',
  'Zona Segura',
  'Buenos Arcos',
  'Bancas Disponibles',
  'Agua Potable',
] as const;

export const createReviewSchema = z.object({
  rating: z
    .number({ message: 'La calificación es obligatoria' })
    .int({ message: 'La calificación debe ser un número entero' })
    .min(1, { message: 'La calificación mínima es 1' })
    .max(5, { message: 'La calificación máxima es 5' }),
  comment: z
    .string()
    .max(500, { message: 'El comentario no puede exceder 500 caracteres' })
    .optional()
    .nullable(),
  tags: z
    .array(z.string())
    .max(5, { message: 'Puedes seleccionar máximo 5 etiquetas' })
    .optional()
    .default([]),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ==================== PARAMS SCHEMAS ====================

export const fieldIdParamSchema = z.object({
  fieldId: uuidSchema.describe('ID de la cancha'),
});

export type FieldIdParam = z.infer<typeof fieldIdParamSchema>;

// ==================== RESPONSE TYPES ====================

export interface ReviewResponse {
  review_id: string;
  field_id: string;
  player_id: string | null;
  rating: number;
  comment: string | null;
  tags: string[];
  created_at: Date | null;
  updated_at: Date | null;
  users: {
    first_name: string;
    last_name: string;
  } | null;
}

export interface ReviewsAggregation {
  reviews: ReviewResponse[];
  averageRating: number;
  totalCount: number;
  popularTags: string[];
}
