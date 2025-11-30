import { Loader2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { StaffFormFields } from "../components/StaffFormFields";
import { AddStaffModalProps } from "../types";

export function AddStaffModal({
  open,
  onClose,
  staff,
  onChange,
  onPermissionChange,
  onSave,
  saving
}: AddStaffModalProps) {
  const isValid = staff.name.trim() !== '' && staff.email.trim() !== '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
          <DialogDescription>
            Completa la información y asigna permisos
          </DialogDescription>
        </DialogHeader>

        <StaffFormFields
          staff={staff}
          onChange={onChange}
          onPermissionChange={onPermissionChange}
          idPrefix="new"
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onSave}
            className="bg-[#047857] hover:bg-[#047857]/90"
            disabled={!isValid || saving}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Agregar Empleado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
