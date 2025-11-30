// ==================== Props Types ====================

export interface ProfileSettingsScreenProps {
  onBack: () => void;
}

export interface SectionViewProps {
  onBack: () => void;
}

// ==================== Profile Types ====================

export interface ProfileData {
  name: string;
  position: string;
  level: string;
  bio: string;
}

export interface NotificationSettings {
  reservations: boolean;
  chats: boolean;
  promotions: boolean;
}

// ==================== Team Types ====================

export interface Team {
  name: string;
  role: 'Capitán' | 'Miembro';
  members: number;
}

export interface TeamInvite {
  name: string;
  invitedBy?: string;
}

// ==================== History Types ====================

export interface BookingHistory {
  field: string;
  date: string;
  price: number;
}

export interface MatchStats {
  total: number;
  won: number;
  lost: number;
}

// ==================== Payment Types ====================

export interface PaymentMethod {
  type: 'visa' | 'mastercard' | 'yape' | 'plin';
  lastFour?: string;
  phone?: string;
  expiryDate?: string;
  verified?: boolean;
}

export interface Transaction {
  description: string;
  date: string;
  amount: number;
  status: 'Completado' | 'Pendiente' | 'Fallido';
}

// ==================== Section Types ====================

export type ActiveSection = 'profile' | 'teams' | 'notifications' | 'history' | 'payments' | null;

// ==================== Constants ====================

export const INITIAL_PROFILE: ProfileData = {
  name: '',
  position: 'Delantero',
  level: 'Intermedio',
  bio: ''
};

export const INITIAL_NOTIFICATIONS: NotificationSettings = {
  reservations: true,
  chats: true,
  promotions: false
};

export const POSITION_OPTIONS = [
  { value: 'Portero', label: 'Portero' },
  { value: 'Defensa', label: 'Defensa' },
  { value: 'Mediocampista', label: 'Mediocampista' },
  { value: 'Delantero', label: 'Delantero' },
  { value: 'Volante', label: 'Volante' }
];

export const LEVEL_OPTIONS = [
  { value: 'Principiante', label: 'Principiante' },
  { value: 'Intermedio', label: 'Intermedio' },
  { value: 'Avanzado', label: 'Avanzado' },
  { value: 'Profesional', label: 'Profesional' }
];
