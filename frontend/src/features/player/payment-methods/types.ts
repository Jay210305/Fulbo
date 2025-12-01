import { LucideIcon } from 'lucide-react';

export interface PaymentMethodsScreenProps {
  matchName: string;
  onBack: () => void;
  onPaymentComplete: (matchName: string) => void;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
}

export interface PaymentState {
  selectedMethod: string;
  loading: boolean;
}

export interface CartField {
  id: string;
  name: string;
  location: string;
  type?: string;
}

export interface CartState {
  field: CartField | null;
  selectedTime: string | null;
  duration: number;
}

export interface BookingPayload {
  fieldId: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  paymentMethod: string;
  matchName: string;
}

export interface BookingResponse {
  booking_id: string;
  message?: string;
}

export interface NewMatch {
  id: string;
  name: string;
  fieldName: string;
  location: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: 'upcoming';
  players: number;
  maxPlayers: number;
  hasRival: boolean;
  chatId: string;
  isPending: boolean;
}

export interface NewChat {
  id: string;
  matchId: string;
  matchName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isPermanent: boolean;
}
