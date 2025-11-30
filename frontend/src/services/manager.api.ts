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

// --- Business Profile Types ---
export interface BusinessProfileSettings {
  // Notification settings
  newReservations?: boolean;
  cancellations?: boolean;
  paymentReceived?: boolean;
  lowInventory?: boolean;
  customerReviews?: boolean;
  weeklyReport?: boolean;
  monthlyReport?: boolean;
  marketingUpdates?: boolean;
  // Integration settings
  posEnabled?: boolean;
  accountingEnabled?: boolean;
  analyticsEnabled?: boolean;
  // Add more as needed
  [key: string]: boolean | string | number | undefined;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  ruc: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  settings: BusinessProfileSettings | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBusinessProfileDto {
  businessName?: string;
  ruc?: string;
  address?: string;
  phone?: string;
  email?: string;
  settings?: BusinessProfileSettings;
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

  // Business Profile operations
  profile: {
    /**
     * Get the business profile for the authenticated manager
     * Returns null if profile doesn't exist
     */
    get: async (): Promise<{ profile: BusinessProfile | null }> => {
      try {
        return await api.get<{ profile: BusinessProfile }>('/manager/profile');
      } catch (error: unknown) {
        // If 404, profile doesn't exist yet
        if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
          return { profile: null };
        }
        throw error;
      }
    },

    /**
     * Create or update the business profile
     */
    update: async (data: UpdateBusinessProfileDto): Promise<{ message: string; profile: BusinessProfile }> => {
      return api.put<{ message: string; profile: BusinessProfile }>('/manager/profile', data);
    },
  },

  // Booking operations for manager
  bookings: {
    /**
     * Get all bookings for manager's fields
     */
    getAll: async (filters?: {
      startDate?: string;
      endDate?: string;
      fieldId?: string;
      status?: 'pending' | 'confirmed' | 'cancelled';
    }): Promise<ManagerBooking[]> => {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.fieldId) params.append('fieldId', filters.fieldId);
      if (filters?.status) params.append('status', filters.status);
      
      const queryString = params.toString();
      const url = queryString ? `/manager/bookings?${queryString}` : '/manager/bookings';
      return api.get<ManagerBooking[]>(url);
    },
  },

  // Stats operations
  stats: {
    /**
     * Get dashboard stats
     */
    get: async (period: 'today' | 'week' | 'month' | 'all' = 'today'): Promise<ManagerStats> => {
      return api.get<ManagerStats>(`/manager/stats?period=${period}`);
    },

    /**
     * Get revenue chart data
     */
    getChart: async (days: number = 7): Promise<ChartData[]> => {
      return api.get<ChartData[]>(`/manager/stats/chart?days=${days}`);
    },
  },

  // Staff operations
  staff: {
    /**
     * Get all staff members
     */
    getAll: async (): Promise<StaffMember[]> => {
      return api.get<StaffMember[]>('/manager/staff');
    },

    /**
     * Get a specific staff member
     */
    getById: async (staffId: string): Promise<StaffMember> => {
      return api.get<StaffMember>(`/manager/staff/${staffId}`);
    },

    /**
     * Create a new staff member
     */
    create: async (data: CreateStaffDto): Promise<{ message: string; staff: StaffMember }> => {
      return api.post<{ message: string; staff: StaffMember }>('/manager/staff', data);
    },

    /**
     * Update a staff member
     */
    update: async (staffId: string, data: UpdateStaffDto): Promise<{ message: string; staff: StaffMember }> => {
      return api.put<{ message: string; staff: StaffMember }>(`/manager/staff/${staffId}`, data);
    },

    /**
     * Delete a staff member
     */
    delete: async (staffId: string): Promise<{ message: string }> => {
      return api.delete<{ message: string }>(`/manager/staff/${staffId}`);
    },

    /**
     * Toggle staff active status
     */
    toggleActive: async (staffId: string, isActive: boolean): Promise<{ message: string; staff: { id: string; isActive: boolean } }> => {
      return api.patch<{ message: string; staff: { id: string; isActive: boolean } }>(`/manager/staff/${staffId}/toggle-active`, { isActive });
    },
  },

  // Payment settings operations
  paymentSettings: {
    /**
     * Get payment settings
     */
    get: async (): Promise<PaymentSettings> => {
      return api.get<PaymentSettings>('/manager/payment-settings');
    },

    /**
     * Update payment settings
     */
    update: async (data: UpdatePaymentSettingsDto): Promise<{ message: string; settings: PaymentSettings }> => {
      return api.put<{ message: string; settings: PaymentSettings }>('/manager/payment-settings', data);
    },
  },
};

// --- Additional Types ---
export interface ManagerBooking {
  id: string;
  fieldId: string;
  fieldName: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
  paymentStatus: 'pending' | 'succeeded' | 'failed';
  createdAt: string;
}

export interface ManagerStats {
  totalRevenue: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  uniqueCustomers: number;
  averageBookingValue: number;
}

export interface ChartData {
  day: string;
  date: string;
  ingresos: number;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'encargado' | 'administrador' | 'recepcionista' | 'mantenimiento';
  permissions: Record<string, boolean>;
  isActive: boolean;
  createdAt: string;
}

export interface CreateStaffDto {
  name: string;
  email: string;
  phone?: string;
  role?: 'encargado' | 'administrador' | 'recepcionista' | 'mantenimiento';
  permissions?: Record<string, boolean>;
}

export interface UpdateStaffDto {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'encargado' | 'administrador' | 'recepcionista' | 'mantenimiento';
  permissions?: Record<string, boolean>;
  isActive?: boolean;
}

export interface PaymentSettings {
  id?: string;
  yapeEnabled: boolean;
  yapePhone: string | null;
  plinEnabled: boolean;
  plinPhone: string | null;
  bankTransferEnabled: boolean;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  bankCci: string | null;
  cashEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdatePaymentSettingsDto {
  yapeEnabled?: boolean;
  yapePhone?: string;
  plinEnabled?: boolean;
  plinPhone?: string;
  bankTransferEnabled?: boolean;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  bankCci?: string;
  cashEnabled?: boolean;
}

export default managerApi;
