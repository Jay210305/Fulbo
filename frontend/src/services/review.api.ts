import { api } from './api';

// ==================== TYPES ====================

export interface Review {
  review_id: string;
  field_id: string;
  player_id: string | null;
  rating: number;
  comment: string | null;
  tags: string[];
  created_at: string | null;
  updated_at: string | null;
  users: {
    first_name: string;
    last_name: string;
  } | null;
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalCount: number;
  popularTags: string[];
}

export interface CreateReviewData {
  rating: number;
  comment?: string;
  tags?: string[];
}

export interface CanReviewResponse {
  canReview: boolean;
  hasExistingReview: boolean;
  existingReview: Review | null;
}

// ==================== PREDEFINED TAGS ====================

export const REVIEW_TAGS = [
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

export type ReviewTag = typeof REVIEW_TAGS[number];

// ==================== API METHODS ====================

/**
 * Create or update a review for a field
 */
export async function createReview(fieldId: string, data: CreateReviewData) {
  return api.post<{ message: string; review: Review }>(
    `/reviews/${fieldId}`,
    data
  );
}

/**
 * Get all reviews for a field
 */
export async function getReviews(fieldId: string) {
  return api.get<ReviewsResponse>(`/reviews/${fieldId}`, { requiresAuth: false });
}

/**
 * Check if current user can review a field
 */
export async function canReviewField(fieldId: string) {
  return api.get<CanReviewResponse>(`/reviews/${fieldId}/can-review`);
}
