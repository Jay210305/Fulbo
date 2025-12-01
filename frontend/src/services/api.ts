// Base API configuration
const API_BASE_URL = 'http://localhost:4000/api';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `Error ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

// ==================== PRODUCT API ====================

export type ProductCategory = 'bebida' | 'snack' | 'equipo' | 'promocion';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: ProductCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithField extends Product {
  fieldId: string;
  fieldName: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: ProductCategory;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: ProductCategory;
  isActive?: boolean;
}

interface ProductResponse {
  message: string;
  product: Product;
}

export const ProductApi = {
  /**
   * Get all products for a specific field
   */
  getByField: (fieldId: string) =>
    api.get<Product[]>(`/manager/fields/${fieldId}/products`),

  /**
   * Get a specific product by ID
   */
  getById: (productId: string) =>
    api.get<ProductWithField>(`/manager/products/${productId}`),

  /**
   * Create a new product for a field
   */
  create: (fieldId: string, data: CreateProductDto) =>
    api.post<ProductResponse>(`/manager/fields/${fieldId}/products`, data),

  /**
   * Update an existing product
   */
  update: (productId: string, data: UpdateProductDto) =>
    api.put<ProductResponse>(`/manager/products/${productId}`, data),

  /**
   * Delete a product (soft delete)
   */
  delete: (productId: string) =>
    api.delete<{ message: string }>(`/manager/products/${productId}`),

  /**
   * Toggle product active status
   */
  toggleActive: (productId: string, isActive: boolean) =>
    api.patch<{ message: string; product: { id: string; isActive: boolean } }>(
      `/manager/products/${productId}/toggle-active`,
      { isActive }
    ),
};

// ==================== SCHEDULE BLOCK API ====================

export type ScheduleBlockReason = 'maintenance' | 'personal' | 'event';

export interface ScheduleBlock {
  id: string;
  fieldId: string;
  fieldName: string;
  startTime: string;
  endTime: string;
  reason: ScheduleBlockReason;
  note: string | null;
  createdAt: string;
}

export interface CreateScheduleBlockDto {
  fieldId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  reason: ScheduleBlockReason;
  note?: string;
}

export interface BookingConflict {
  bookingId: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail: string;
}

interface ScheduleBlockResponse {
  message: string;
  block: ScheduleBlock;
}

interface ScheduleBlockConflictError {
  message: string;
  conflicts?: BookingConflict[];
}

export const ScheduleBlockApi = {
  /**
   * Get all schedule blocks for all manager's fields
   */
  getAll: (filters?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<ScheduleBlock[]>(`/manager/schedule/blocks${query}`);
  },

  /**
   * Get schedule blocks for a specific field
   */
  getByField: (fieldId: string, filters?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<ScheduleBlock[]>(`/manager/fields/${fieldId}/schedule/blocks${query}`);
  },

  /**
   * Get a specific schedule block by ID
   */
  getById: (blockId: string) =>
    api.get<ScheduleBlock>(`/manager/schedule/blocks/${blockId}`),

  /**
   * Create a new schedule block
   */
  create: (data: CreateScheduleBlockDto) =>
    api.post<ScheduleBlockResponse>('/manager/schedule/block', data),

  /**
   * Delete a schedule block
   */
  delete: (blockId: string) =>
    api.delete<{ message: string }>(`/manager/schedule/block/${blockId}`),
};

// ==================== FIELD AVAILABILITY API (Player View) ====================

export interface UnavailableSlot {
  id: string;
  startTime: string;
  endTime: string;
  type: 'booking' | 'block';
  reason: ScheduleBlockReason | null;
}

export interface FieldAvailability {
  fieldId: string;
  fieldName: string;
  startDate: string;
  endDate: string;
  unavailableSlots: UnavailableSlot[];
}

export const FieldAvailabilityApi = {
  /**
   * Get field availability for a date range
   */
  getAvailability: (fieldId: string, startDate: string, endDate: string) =>
    api.get<FieldAvailability>(
      `/fields/${fieldId}/availability?startDate=${startDate}&endDate=${endDate}`,
      { requiresAuth: false }
    ),
};

// ==================== PROMOTION API ====================

export type PromotionDiscountType = 'percentage' | 'fixed_amount';

export interface Promotion {
  id: string;
  fieldId?: string;
  fieldName?: string;
  title: string;
  description: string | null;
  discountType: PromotionDiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionDto {
  title: string;
  description?: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
}

export interface UpdatePromotionDto {
  title?: string;
  description?: string;
  discountType?: PromotionDiscountType;
  discountValue?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

interface PromotionResponse {
  message: string;
  promotion: Promotion;
}

export const PromotionApi = {
  /**
   * Get all promotions for a specific field
   */
  getByField: (fieldId: string) =>
    api.get<Promotion[]>(`/manager/fields/${fieldId}/promotions`),

  /**
   * Get a specific promotion by ID
   */
  getById: (promotionId: string) =>
    api.get<Promotion>(`/manager/promotions/${promotionId}`),

  /**
   * Create a new promotion for a field
   */
  create: (fieldId: string, data: CreatePromotionDto) =>
    api.post<PromotionResponse>(`/manager/fields/${fieldId}/promotions`, data),

  /**
   * Update an existing promotion
   */
  update: (promotionId: string, data: UpdatePromotionDto) =>
    api.put<PromotionResponse>(`/manager/promotions/${promotionId}`, data),

  /**
   * Delete a promotion (soft delete)
   */
  delete: (promotionId: string) =>
    api.delete<{ message: string }>(`/manager/promotions/${promotionId}`),

  /**
   * Deactivate a promotion
   */
  deactivate: (promotionId: string) =>
    api.patch<{ message: string; promotion: { id: string; isActive: boolean } }>(
      `/manager/promotions/${promotionId}/deactivate`
    ),
};

// ==================== BOOKING API (Player) ====================

export interface PlayerBooking {
  booking_id: string;
  player_id: string;
  field_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  fields: {
    field_id: string;
    name: string;
    address: string;
    owner_id: string;
  };
}

export interface FieldBooking {
  booking_id: string;
  player_id: string;
  field_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  users: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
  };
}

export interface CreateBookingDto {
  fieldId: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  paymentMethod?: string;
  matchName?: string;
}

export const BookingApi = {
  /**
   * Get all bookings for the current user (player history)
   */
  getUserBookings: () =>
    api.get<PlayerBooking[]>('/bookings/user'),

  /**
   * Get bookings for a specific field with optional date filtering
   */
  getFieldBookings: (fieldId: string, filters?: { from?: string; to?: string }) => {
    const params = new URLSearchParams();
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<FieldBooking[]>(`/bookings/field/${fieldId}${query}`);
  },

  /**
   * Get a specific booking by ID
   */
  getById: (bookingId: string) =>
    api.get<PlayerBooking>(`/bookings/${bookingId}`),

  /**
   * Create a new booking
   */
  create: (data: CreateBookingDto) =>
    api.post<PlayerBooking>('/bookings', data),

  /**
   * Cancel a booking
   */
  cancel: (bookingId: string) =>
    api.patch<{ message: string; booking: PlayerBooking }>(`/bookings/${bookingId}/cancel`),
};

export { ApiError };
export default api;
