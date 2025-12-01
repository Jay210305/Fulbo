import { Promotion, PromotionDiscountType } from "../../../services/api";

// ==================== Props Types ====================

export interface PromotionsManagementProps {
  fieldId: string;
  fieldName: string;
  onBack: () => void;
}

// ==================== Form Types ====================

export interface NewPromotionForm {
  title: string;
  description: string;
  discountType: PromotionDiscountType;
  discountValue: string;
  startDate: string;
  endDate: string;
  image: string;
}

export const INITIAL_PROMOTION_FORM: NewPromotionForm = {
  title: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  startDate: '',
  endDate: '',
  image: ''
};

// ==================== Component Props ====================

export interface PromotionsHeaderProps {
  fieldName: string;
  onBack: () => void;
}

export interface PromotionCardProps {
  promotion: Promotion;
  onEdit: (promotion: Promotion) => void;
  onDeactivate: (promotion: Promotion) => void;
}

export interface InactivePromotionCardProps {
  promotion: Promotion;
}

export interface PromotionsListProps {
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCreateClick: () => void;
  onEditClick: (promotion: Promotion) => void;
  onDeactivateClick: (promotion: Promotion) => void;
}

export interface PromotionFormFieldsProps {
  data: NewPromotionForm | Promotion;
  onChange: (data: NewPromotionForm | Promotion) => void;
  isEdit?: boolean;
}

export interface CreatePromotionModalProps {
  open: boolean;
  onClose: () => void;
  promotion: NewPromotionForm;
  onChange: (promotion: NewPromotionForm) => void;
  onSave: () => void;
  saving: boolean;
}

export interface EditPromotionModalProps {
  open: boolean;
  onClose: () => void;
  promotion: Promotion | null;
  onChange: (promotion: Promotion) => void;
  onSave: () => void;
  saving: boolean;
}

export interface DeactivatePromotionDialogProps {
  open: boolean;
  onClose: () => void;
  promotionTitle?: string;
  onConfirm: () => void;
  saving: boolean;
}

// Re-export API types for convenience
export type { Promotion, PromotionDiscountType };
