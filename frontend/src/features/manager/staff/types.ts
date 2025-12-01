import { StaffMember as ApiStaffMember } from "../../../services/manager.api";

// ==================== Props Types ====================

export interface StaffManagementScreenProps {
  onBack: () => void;
}

// ==================== Staff Types ====================

export type StaffRole = 'encargado' | 'administrador' | 'recepcionista' | 'mantenimiento';

export interface StaffPermissions {
  viewRevenue: boolean;
  editPrices: boolean;
  createManualBookings: boolean;
  manageFields: boolean;
  viewReports: boolean;
  managePromotions: boolean;
}

export interface NewStaffForm {
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  permissions: StaffPermissions;
}

// ==================== Component Props ====================

export interface StaffCardProps {
  member: ApiStaffMember;
  onEdit: () => void;
  onDelete: () => void;
}

export interface StaffFormProps {
  staff: NewStaffForm;
  onChange: (updates: Partial<NewStaffForm>) => void;
  onPermissionChange: (key: keyof StaffPermissions, value: boolean) => void;
}

export interface AddStaffModalProps {
  open: boolean;
  onClose: () => void;
  staff: NewStaffForm;
  onChange: (updates: Partial<NewStaffForm>) => void;
  onPermissionChange: (key: keyof StaffPermissions, value: boolean) => void;
  onSave: () => void;
  saving: boolean;
}

export interface EditStaffModalProps {
  open: boolean;
  onClose: () => void;
  staff: ApiStaffMember | null;
  onStaffChange: (staff: ApiStaffMember) => void;
  onSave: () => void;
  saving: boolean;
}

export interface DeleteStaffDialogProps {
  open: boolean;
  onClose: () => void;
  staffName?: string;
  onConfirm: () => void;
  saving: boolean;
}

// ==================== Constants ====================

export const ROLE_LABELS: Record<StaffRole, string> = {
  encargado: 'Encargado',
  administrador: 'Administrador',
  recepcionista: 'Recepcionista',
  mantenimiento: 'Mantenimiento'
};

export const PERMISSION_LABELS: Record<keyof StaffPermissions, string> = {
  viewRevenue: 'Ver Ingresos y Estadísticas',
  editPrices: 'Editar Precios de Canchas',
  createManualBookings: 'Crear Reservas Manuales',
  manageFields: 'Gestionar Canchas',
  viewReports: 'Ver Reportes Avanzados',
  managePromotions: 'Gestionar Promociones'
};

export const INITIAL_NEW_STAFF: NewStaffForm = {
  name: '',
  email: '',
  phone: '',
  role: 'encargado',
  permissions: {
    viewRevenue: false,
    editPrices: false,
    createManualBookings: false,
    manageFields: false,
    viewReports: false,
    managePromotions: false
  }
};

// ==================== Re-exports ====================

export type { ApiStaffMember as StaffMember };
