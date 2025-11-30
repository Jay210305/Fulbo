import { Product, ProductCategory, CreateProductDto, UpdateProductDto } from "../../../services/api";

// ==================== Props Types ====================

export interface FulVasoManagementProps {
  fieldId: string;
  fieldName: string;
  onBack: () => void;
}

// ==================== Form Types ====================

export interface ProductForm {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: ProductCategory;
}

export const INITIAL_PRODUCT_FORM: ProductForm = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  category: 'bebida'
};

// ==================== Constants ====================

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  bebida: 'Bebida',
  snack: 'Snack',
  equipo: 'Equipo',
  promocion: 'Promoción'
};

// ==================== Component Props ====================

export interface ProductHeaderProps {
  fieldName: string;
  onBack: () => void;
}

export interface ProductStatsProps {
  total: number;
  active: number;
  inactive: number;
}

export interface ProductCardProps {
  product: Product;
  onToggleActive: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export interface ProductListProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onAddClick: () => void;
  onToggleActive: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export interface ProductFormFieldsProps {
  product: ProductForm;
  onChange: (product: ProductForm) => void;
}

export interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product: ProductForm;
  onChange: (product: ProductForm) => void;
  onSave: () => void;
  saving: boolean;
  isEdit: boolean;
}

// Re-export API types for convenience
export type { Product, ProductCategory, CreateProductDto, UpdateProductDto };
