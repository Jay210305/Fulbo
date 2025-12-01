import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: string;
  /** Confirm button text */
  confirmLabel?: string;
  /** Cancel button text */
  cancelLabel?: string;
  /** Confirm button variant */
  variant?: 'default' | 'destructive';
  /** Callback when confirmed */
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
}: ConfirmDialogProps) {
  const actionClassName =
    variant === 'destructive'
      ? 'bg-destructive hover:bg-destructive/90'
      : 'bg-[#047857] hover:bg-[#047857]/90';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={actionClassName}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface DeleteDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Item name to display in the message */
  itemName: string;
  /** Custom title (optional) */
  title?: string;
  /** Custom description (optional) */
  description?: string;
  /** Callback when confirmed */
  onConfirm: () => void;
}

export function DeleteDialog({
  open,
  onOpenChange,
  itemName,
  title = '¿Eliminar permanentemente?',
  description,
  onConfirm,
}: DeleteDialogProps) {
  const defaultDescription = `¿Confirmas la eliminación permanente de "${itemName}"? Esta acción no se puede deshacer.`;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description || defaultDescription}
      confirmLabel="Eliminar"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}

interface DeactivateDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Item name to display in the message */
  itemName: string;
  /** Callback when confirmed */
  onConfirm: () => void;
}

export function DeactivateDialog({
  open,
  onOpenChange,
  itemName,
  onConfirm,
}: DeactivateDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="¿Desactivar?"
      description={`¿Estás seguro que deseas desactivar "${itemName}"? Se pausará y dejará de ser visible, pero podrás reactivarlo más tarde.`}
      confirmLabel="Desactivar"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}
