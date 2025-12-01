import { Loader2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Checkbox } from "../../../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { StaffMember } from "../../../../services/manager.api";
import { StaffRole, StaffPermissions, PERMISSION_LABELS } from "../types";

interface EditStaffModalProps {
  open: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  onStaffChange: (staff: StaffMember) => void;
  onSave: () => void;
  saving: boolean;
}

export function EditStaffModal({
  open,
  onClose,
  staff,
  onStaffChange,
  onSave,
  saving
}: EditStaffModalProps) {
  if (!staff) return null;

  const updateField = (field: keyof StaffMember, value: string) => {
    onStaffChange({ ...staff, [field]: value } as StaffMember);
  };

  const updatePermission = (key: keyof StaffPermissions, value: boolean) => {
    onStaffChange({
      ...staff,
      permissions: { ...staff.permissions, [key]: value }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Empleado</DialogTitle>
          <DialogDescription>
            Modifica la información y permisos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nombre Completo *</Label>
            <Input
              value={staff.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={staff.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input
              type="tel"
              value={staff.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Rol *</Label>
            <Select
              value={staff.role}
              onValueChange={(value: StaffRole) => onStaffChange({ ...staff, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="encargado">Encargado</SelectItem>
                <SelectItem value="administrador">Administrador</SelectItem>
                <SelectItem value="recepcionista">Recepcionista</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <Label>Permisos</Label>
            {(Object.entries(PERMISSION_LABELS) as [keyof StaffPermissions, string][]).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={`edit-${key}`}
                  checked={staff.permissions[key] || false}
                  onCheckedChange={(checked: boolean) => updatePermission(key, checked)}
                />
                <label htmlFor={`edit-${key}`} className="text-sm cursor-pointer">
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onSave}
            className="bg-[#047857] hover:bg-[#047857]/90"
            disabled={saving}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
