import api from './api';

// --- Types matching backend response ---
export interface FieldPhoto {
  id: string;
  url: string;
  isCover: boolean;
}

export interface FieldPromotion {
  id: string;
  title: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface Field {
  id: string;
  name: string;
  address: string;
  description?: string;
  amenities: Record<string, boolean>;
  basePricePerHour: number;
  photos: FieldPhoto[];
  promotions: FieldPromotion[];
  stats: {
    bookingsCount: number;
    reviewsCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

// --- Request DTOs ---
export interface CreateFieldDto {
  name: string;
  address: string;
  description?: string;
  amenities?: Record<string, boolean>;
  basePricePerHour: number;
}

export interface UpdateFieldDto {
  name?: string;
  address?: string;
  description?: string;
  amenities?: Record<string, boolean>;
  basePricePerHour?: number;
}

// --- Response types ---
interface CreateFieldResponse {
  message: string;
  field: Field;
}

interface UpdateFieldResponse {
  message: string;
  field: Field;
}

interface DeleteFieldResponse {
  message: string;
}

// --- Manager API functions ---
export const managerApi = {
  // Field CRUD operations
  fields: {
    /**
     * Get all fields owned by the authenticated manager
     */
    getAll: async (): Promise<Field[]> => {
      return api.get<Field[]>('/manager/fields');
    },

    /**
     * Get a specific field by ID
     */
    getById: async (fieldId: string): Promise<Field> => {
      return api.get<Field>(`/manager/fields/${fieldId}`);
    },

    /**
     * Create a new field
     */
    create: async (data: CreateFieldDto): Promise<CreateFieldResponse> => {
      return api.post<CreateFieldResponse>('/manager/fields', data);
    },

    /**
     * Update an existing field
     */
    update: async (fieldId: string, data: UpdateFieldDto): Promise<UpdateFieldResponse> => {
      return api.put<UpdateFieldResponse>(`/manager/fields/${fieldId}`, data);
    },

    /**
     * Soft delete a field
     */
    delete: async (fieldId: string): Promise<DeleteFieldResponse> => {
      return api.delete<DeleteFieldResponse>(`/manager/fields/${fieldId}`);
    },
  },
};

export default managerApi;
