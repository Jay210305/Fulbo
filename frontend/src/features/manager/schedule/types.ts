import { ScheduleBlock, ScheduleBlockReason, BookingConflict } from '../../../services/api';
import { ManagerBooking } from '../../../services/manager.api';

// ============================================================================
// Core Interfaces
// ============================================================================

export interface Match {
  id: string;
  time: string;
  duration: string;
  team: string;
  field: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  players: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentStatus: 'paid' | 'pending';
}

export interface Field {
  id: string;
  name: string;
  type?: string;
}

// ============================================================================
// Form Interfaces
// ============================================================================

export interface NewReservationForm {
  field: string;
  time: string;
  duration: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentStatus: 'paid' | 'pending';
}

export interface NewBlockForm {
  fieldId: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  reason: ScheduleBlockReason | '';
  note: string;
}

// ============================================================================
// Constants
// ============================================================================

export const INITIAL_RESERVATION_FORM: NewReservationForm = {
  field: '',
  time: '',
  duration: '',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  paymentStatus: 'pending',
};

export const INITIAL_BLOCK_FORM: NewBlockForm = {
  fieldId: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  reason: '',
  note: '',
};

export const REASON_LABELS: Record<ScheduleBlockReason, string> = {
  maintenance: 'Mantenimiento',
  personal: 'Personal',
  event: 'Evento',
};

export const REASON_COLORS: Record<ScheduleBlockReason, string> = {
  maintenance: 'bg-orange-500',
  personal: 'bg-purple-500',
  event: 'bg-blue-500',
};

// ============================================================================
// Helper Functions
// ============================================================================

export function bookingToMatch(booking: ManagerBooking): Match {
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

  const customerName = booking.customer?.name || 'Sin nombre';

  return {
    id: booking.id,
    time: startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    duration: durationHours === 1 ? '1h' : `${durationHours}h`,
    team: customerName,
    field: booking.fieldName,
    status: booking.status === 'confirmed' ? 'confirmed' :
            booking.status === 'cancelled' ? 'cancelled' : 'pending',
    players: 0,
    customerName,
    customerPhone: booking.customer?.phone || '',
    customerEmail: booking.customer?.email || '',
    paymentStatus: booking.paymentStatus === 'succeeded' ? 'paid' : 'pending',
  };
}

export function formatDateSpanish(date: Date | undefined): string {
  if (!date) return '';
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// ============================================================================
// Re-exports for convenience
// ============================================================================

export type { ScheduleBlock, ScheduleBlockReason, BookingConflict };
