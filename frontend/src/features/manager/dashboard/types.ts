import { Field, ManagerStats, ChartData, ManagerBooking } from "../../../services/manager.api";

// ==================== Props Types ====================

export interface ManagerDashboardProps {
  onNavigateToSchedule?: () => void;
  onNavigateToFields?: () => void;
}

// ==================== State Types ====================

export interface DashboardState {
  fields: Field[];
  stats: ManagerStats | null;
  chartData: ChartData[];
  todayBookings: ManagerBooking[];
}

export interface DashboardLoadingState {
  fields: boolean;
  stats: boolean;
  chart: boolean;
  bookings: boolean;
}

export interface ModalState {
  showCustomDatePicker: boolean;
  showFieldSchedule: boolean;
  showEditModal: boolean;
  showContactModal: boolean;
}

// ==================== Component Props ====================

export interface StatsCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  loading?: boolean;
}

export interface StatsSectionProps {
  stats: ManagerStats | null;
  loading: boolean;
  timePeriod: TimePeriod;
}

export interface PeriodFilterProps {
  timePeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  onCustomClick: () => void;
  dateRange?: DateRange;
}

export interface RevenueChartProps {
  data: ChartData[];
  loading: boolean;
}

export interface TodaysBookingsProps {
  bookings: ManagerBooking[];
  loading: boolean;
  onViewAll?: () => void;
}

export interface FieldsListProps {
  fields: Field[];
  loading: boolean;
  onViewAll?: () => void;
  onViewSchedule: (field: Field) => void;
}

export interface FieldScheduleModalProps {
  open: boolean;
  onClose: () => void;
  field: Field | null;
  bookings: ManagerBooking[];
  onEditMatch: (match: ManagerBooking) => void;
  onContactMatch: (match: ManagerBooking) => void;
}

export interface EditMatchModalProps {
  open: boolean;
  onClose: () => void;
  match: ManagerBooking | null;
  onSave: (match: ManagerBooking) => void;
}

export interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  match: ManagerBooking | null;
}

export interface CustomDatePickerModalProps {
  open: boolean;
  onClose: () => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onApply: () => void;
}

// ==================== Utility Types ====================

export type TimePeriod = 'today' | 'week' | 'month' | 'custom';

export interface DateRange {
  from?: Date;
  to?: Date;
}

// ==================== Re-exports ====================

export type { Field, ManagerStats, ChartData, ManagerBooking };
