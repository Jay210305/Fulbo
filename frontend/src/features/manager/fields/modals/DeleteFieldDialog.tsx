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
import { FieldDisplay } from "../types";

interface DeleteFieldDialogProps {
  field: FieldDisplay | null;
  onClose: () => void;
  onConfirm: () => void;
  saving: boolean;
}

export function DeleteFieldDialog({
  field,
  onClose,
  onConfirm,
  saving
}: DeleteFieldDialogProps) {
  return (
    <AlertDialog open={!!field} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar cancha?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar "{field?.name}"? 
            Esta acción marcará la cancha como inactiva. El historial de reservas se conservará.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            disabled={saving}
            onClick={onConfirm}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
