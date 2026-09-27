import { api } from './api';

export interface FieldPhoto {
  id: string;
  url: string;
  isCover: boolean;
}

export interface FieldPromotion {
  id: string;
  title: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface Field {
  id: string;
  name: string;
  address: string;
  description?: string | null;
  type?: string;
  surface?: string | null;
  capacity?: number | null;
  amenities: Record<string, boolean>;
  basePricePerHour: number;
  weekendSurcharge?: number | null;
  nightSurcharge?: number | null;
  status: string;
  hasFullVaso: boolean;
  fullVasoPromo?: string | null;
  photos: FieldPhoto[];
  promotions: FieldPromotion[];
  stats: { bookingsCount: number; reviewsCount: number };
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const FieldApi = {
  getFields: () => api.get<Field[]>('/fields', { requiresAuth: false }),

  getFieldById: (id: string) =>
    api.get<Field>(`/fields/${id}`, { requiresAuth: false }),
};
