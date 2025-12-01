import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Checkbox } from "../../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { NewStaffForm, StaffPermissions, StaffRole, PERMISSION_LABELS } from "../types";

interface StaffFormFieldsProps {
  staff: NewStaffForm;
  onChange: (updates: Partial<NewStaffForm>) => void;
  onPermissionChange: (key: keyof StaffPermissions, value: boolean) => void;
  idPrefix: string;
}

export function StaffFormFields({ 
  staff, 
  onChange, 
  onPermissionChange, 
  idPrefix 
}: StaffFormFieldsProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Nombre Completo *</Label>
        <Input
          value={staff.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Juan Pérez"
        />
      </div>

      <div className="space-y-2">
        <Label>Email *</Label>
        <Input
          type="email"
          value={staff.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="juan@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label>Teléfono</Label>
        <Input
          type="tel"
          value={staff.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="+51 987 654 321"
        />
      </div>

      <div className="space-y-2">
        <Label>Rol *</Label>
        <Select
          value={staff.role}
          onValueChange={(value: StaffRole) => onChange({ role: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="encargado">Encargado</SelectItem>
            <SelectItem value="administrador">Administrador</SelectItem>
            <SelectItem value="recepcionista">Recepcionista</SelectItem>
            <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PermissionsCheckboxes
        permissions={staff.permissions}
        onChange={onPermissionChange}
        idPrefix={idPrefix}
      />
    </div>
  );
}

interface PermissionsCheckboxesProps {
  permissions: StaffPermissions;
  onChange: (key: keyof StaffPermissions, value: boolean) => void;
  idPrefix: string;
}

function PermissionsCheckboxes({ permissions, onChange, idPrefix }: PermissionsCheckboxesProps) {
  return (
    <div className="space-y-3 border-t border-border pt-4">
      <Label>Permisos Específicos</Label>
      
      {(Object.entries(PERMISSION_LABELS) as [keyof StaffPermissions, string][]).map(([key, label]) => (
        <div key={key} className="flex items-center space-x-2">
          <Checkbox
            id={`${idPrefix}-${key}`}
            checked={permissions[key]}
            onCheckedChange={(checked: boolean) => onChange(key, checked)}
          />
          <label
            htmlFor={`${idPrefix}-${key}`}
            className="text-sm cursor-pointer"
          >
            {label}
          </label>
        </div>
      ))}
    </div>
  );
}
