import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";

interface DeleteStaffDialogProps {
  open: boolean;
  onClose: () => void;
  staffName?: string;
  onConfirm: () => void;
  saving: boolean;
}

export function DeleteStaffDialog({
  open,
  onClose,
  staffName,
  onConfirm,
  saving
}: DeleteStaffDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Empleado</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas remover a {staffName} del equipo?
            Esta acción no se puede deshacer y el empleado perderá acceso inmediatamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90"
            disabled={saving}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Remover Empleado
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
