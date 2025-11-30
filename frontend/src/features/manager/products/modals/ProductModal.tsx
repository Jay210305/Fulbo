import { X, Loader2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { ProductFormFields } from "../components/ProductFormFields";
import type { ProductForm } from "../types";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product: ProductForm;
  onChange: (product: ProductForm) => void;
  onSave: () => void;
  saving: boolean;
  isEdit: boolean;
}

export function ProductModal({
  open,
  onClose,
  product,
  onChange,
  onSave,
  saving,
  isEdit
}: ProductModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
          <h2>{isEdit ? 'Editar Producto' : 'Añadir Producto'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <ProductFormFields product={product} onChange={onChange} />
        </div>

        <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-[#047857] hover:bg-[#047857]/90"
            onClick={onSave}
            disabled={saving}
          >
            {saving && <Loader2 className="animate-spin mr-2" size={16} />}
            {isEdit ? 'Guardar Cambios' : 'Agregar Producto'}
          </Button>
        </div>
      </div>
    </div>
  );
}
