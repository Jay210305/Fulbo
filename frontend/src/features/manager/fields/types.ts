import { LucideIcon } from "lucide-react";
import { Field } from "../../../services/manager.api";

// ==================== Display Types ====================

export interface FieldDisplay {
  id: string;
  name: string;
  status: 'active' | 'maintenance';
  rating: number;
  reviewCount?: number;
  capacity: string;
  price: number;
  bookings: number;
  nextBooking: string;
  amenities: string[];
  hasFullVaso: boolean;
  fullVasoPromo: string;
  surface: string;
  maxCapacity: number;
  totalRevenue: number;
  occupancyRate: number;
  description: string;
  address: string;
  images: string[];
}

// ==================== Form Types ====================

export interface NewFieldForm {
  name: string;
  address: string;
  type: string;
  surface: string;
  maxCapacity: string;
  basePrice: string;
  peakHourPrice: string;
  amenities: string[];
  description: string;
  images: string[];
}

export interface EditPriceForm {
  basePrice: string;
  weekendExtra: string;
  nightExtra: string;
  promoDescription: string;
}

export interface BulkEditForm {
  priceAdjustment: string;
  adjustmentType: 'percentage' | 'fixed';
}

export interface AvailabilityForm {
  selectedDate: Date;
  blockedSlots: string[];
  blockReason: string;
  openingHours: string;
  closingHours: string;
}

// ==================== Amenity Types ====================

export interface AmenityConfig {
  id: string;
  name: string;
  icon: LucideIcon;
}

// ==================== Constants ====================

export const INITIAL_NEW_FIELD: NewFieldForm = {
  name: '',
  address: '',
  type: '',
  surface: '',
  maxCapacity: '',
  basePrice: '',
  peakHourPrice: '',
  amenities: [],
  description: ''
};

export const INITIAL_EDIT_PRICE: EditPriceForm = {
  basePrice: '',
  weekendExtra: '',
  nightExtra: '',
  promoDescription: ''
};

export const INITIAL_BULK_EDIT: BulkEditForm = {
  priceAdjustment: '',
  adjustmentType: 'percentage'
};

export const INITIAL_AVAILABILITY: AvailabilityForm = {
  selectedDate: new Date(),
  blockedSlots: [],
  blockReason: '',
  openingHours: '08:00',
  closingHours: '23:00'
};

// ==================== Mapper ====================

export function mapFieldToDisplay(field: Field): FieldDisplay {
  const amenitiesArray = Object.entries(field.amenities || {})
    .filter(([, value]) => value)
    .map(([key]) => key);

  return {
    id: field.id,
    name: field.name,
    status: 'active',
    rating: 4.5,
    capacity: '7v7',
    price: field.basePricePerHour,
    bookings: field.stats.bookingsCount,
    nextBooking: '-',
    amenities: amenitiesArray,
    hasFullVaso: field.promotions.some(p => p.isActive),
    fullVasoPromo: field.promotions.find(p => p.isActive)?.description || '',
    surface: 'Sintético',
    maxCapacity: 14,
    totalRevenue: 0,
    occupancyRate: 0,
    description: field.description || '',
    address: field.address,
    images: field.photos.length > 0 
      ? field.photos.map(p => p.url) 
      : ['https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800']
  };
}
