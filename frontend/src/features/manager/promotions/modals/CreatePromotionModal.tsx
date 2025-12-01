import { X, Loader2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { PromotionFormFields } from "../components/PromotionFormFields";
import type { NewPromotionForm } from "../types";

interface CreatePromotionModalProps {
  open: boolean;
  onClose: () => void;
  promotion: NewPromotionForm;
  onChange: (promotion: NewPromotionForm) => void;
  onSave: () => void;
  saving: boolean;
}

export function CreatePromotionModal({
  open,
  onClose,
  promotion,
  onChange,
  onSave,
  saving
}: CreatePromotionModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
          <h2>Crear Promoción</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <PromotionFormFields
            data={promotion}
            onChange={(data) => onChange(data as NewPromotionForm)}
            isEdit={false}
          />
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
            {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Crear Promoción
          </Button>
        </div>
      </div>
    </div>
  );
}
