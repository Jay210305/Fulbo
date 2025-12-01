// ============================================================================
// Core Interfaces
// ============================================================================

export interface Plan {
  id: string;
  name: string;
  duration: string;
  price: number;
  popular: boolean;
  benefits: string[];
}

export interface Campaign {
  id: number;
  fieldName: string;
  plan: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  status: 'active' | 'inactive';
}

export interface Promotion {
  id: number;
  type: PromotionType;
  name: string;
  description: string;
  value: string;
  field: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

export interface Field {
  id: string;
  name: string;
  type: string;
}

export type PromotionType = 'discount' | '2x1' | 'happyhour';

// ============================================================================
// Form Interfaces
// ============================================================================

export interface NewPromotionForm {
  type: PromotionType;
  name: string;
  description: string;
  value: string;
  field: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

// ============================================================================
// Constants
// ============================================================================

export const INITIAL_PROMOTION_FORM: NewPromotionForm = {
  type: 'discount',
  name: '',
  description: '',
  value: '',
  field: '',
  startDate: undefined,
  endDate: undefined,
};

export const PLANS: Plan[] = [
  {
    id: 'daily',
    name: 'Impulso Diario',
    duration: '1 Día',
    price: 25,
    popular: false,
    benefits: [
      'Destacado en pantalla principal',
      'Aparece en primeras posiciones',
      'Badge "Destacado" visible',
      '24 horas de visibilidad',
    ],
  },
  {
    id: 'weekly',
    name: 'Impulso Semanal',
    duration: '7 Días',
    price: 120,
    popular: true,
    benefits: [
      'Destacado en pantalla principal',
      'Aparece en primeras posiciones',
      'Badge "Destacado" visible',
      '7 días completos de visibilidad',
      'Prioridad en búsquedas',
      'Ahorra S/ 55 vs plan diario',
    ],
  },
  {
    id: 'monthly',
    name: 'Impulso Mensual',
    duration: '30 Días',
    price: 465,
    popular: false,
    benefits: [
      'Destacado en pantalla principal',
      'Aparece en primeras posiciones',
      'Badge "Destacado" visible',
      '30 días completos de visibilidad',
      'Prioridad máxima en búsquedas',
      'Ahorra S/ 285 vs plan diario',
      'Soporte prioritario',
    ],
  },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    fieldName: 'Canchita La Merced',
    plan: 'Impulso Semanal',
    startDate: '2025-10-05',
    endDate: '2025-10-12',
    daysRemaining: 3,
    status: 'active',
  },
];

export const MOCK_FIELDS: Field[] = [
  { id: '1', name: 'Canchita La Merced', type: '7v7' },
  { id: '2', name: 'Estadio Zona Sur', type: '11v11' },
  { id: '3', name: 'Cancha Los Pinos', type: '5v5' },
];

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 1,
    type: 'discount',
    name: '10% OFF',
    description: 'Descuento en Cancha Principal',
    value: '10%',
    field: 'Canchita La Merced',
    startDate: '2025-10-01',
    endDate: '2025-10-31',
    status: 'active',
  },
  {
    id: 2,
    type: 'happyhour',
    name: 'Happy Hour',
    description: '20% OFF de 2pm a 4pm',
    value: '20%',
    field: 'Estadio Zona Sur',
    startDate: '2025-10-15',
    endDate: '2025-11-15',
    status: 'active',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

export function formatDatePE(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
  });
}

export function formatFullDatePE(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-PE');
}
