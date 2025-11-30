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

interface DeactivatePromotionDialogProps {
  open: boolean;
  onClose: () => void;
  promotionTitle?: string;
  onConfirm: () => void;
  saving: boolean;
}

export function DeactivatePromotionDialog({
  open,
  onClose,
  promotionTitle,
  onConfirm,
  saving
}: DeactivatePromotionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Desactivar Promoción?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Desea desactivar la promoción "{promotionTitle}"?
            Ya no será visible para los usuarios y dejará de aplicarse a nuevas reservas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
            disabled={saving}
          >
            {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Desactivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
