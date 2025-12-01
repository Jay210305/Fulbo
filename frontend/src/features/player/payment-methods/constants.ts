import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
} from 'lucide-react';
import { PaymentMethod } from './types';

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'visa',
    name: 'Tarjeta Visa',
    icon: CreditCard,
    description: 'Débito o crédito',
  },
  {
    id: 'mastercard',
    name: 'Tarjeta Mastercard',
    icon: CreditCard,
    description: 'Débito o crédito',
  },
  {
    id: 'yape',
    name: 'Yape',
    icon: Smartphone,
    description: 'Pago instantáneo',
  },
  {
    id: 'plin',
    name: 'Plin',
    icon: Smartphone,
    description: 'Pago instantáneo',
  },
  {
    id: 'transferencia',
    name: 'Transferencia Bancaria',
    icon: Building2,
    description: 'BCP, Interbank, BBVA',
  },
  {
    id: 'efectivo',
    name: 'Efectivo',
    icon: Wallet,
    description: 'Pagar en la cancha',
  },
];
