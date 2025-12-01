import { X, Loader2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Switch } from "../../../../components/ui/switch";
import { FieldDisplay, EditPriceForm } from "../types";

interface EditPriceModalProps {
  field: FieldDisplay | null;
  onClose: () => void;
  editPriceData: EditPriceForm;
  setEditPriceData: React.Dispatch<React.SetStateAction<EditPriceForm>>;
  onSave: () => void;
  saving: boolean;
}

export function EditPriceModal({
  field,
  onClose,
  editPriceData,
  setEditPriceData,
  onSave,
  saving
}: EditPriceModalProps) {
  if (!field) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
          <div>
            <h2>Editar Precio</h2>
            <p className="text-sm text-muted-foreground">{field.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Base Price */}
          <div>
            <Label htmlFor="editBasePrice">Precio Base por Hora *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">S/</span>
              <Input
                id="editBasePrice"
                type="number"
                placeholder="50.00"
                className="h-12 pl-10"
                value={editPriceData.basePrice}
                onChange={(e) => setEditPriceData(prev => ({ ...prev, basePrice: e.target.value }))}
              />
            </div>
          </div>

          {/* Special Rates */}
          <div>
            <Label>Tarifas Especiales</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Define precios adicionales para períodos específicos
            </p>
            
            <div className="space-y-3">
              {/* Weekend Rate */}
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex-1">
                  <p className="text-sm">Fin de Semana</p>
                  <p className="text-xs text-muted-foreground">Sábado y Domingo</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <div className="relative w-24">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">+S/</span>
                    <Input
                      type="number"
                      placeholder="10"
                      className="h-10 pl-10"
                      value={editPriceData.weekendExtra}
                      onChange={(e) => setEditPriceData(prev => ({ ...prev, weekendExtra: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Night Rate */}
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex-1">
                  <p className="text-sm">Horario Nocturno</p>
                  <p className="text-xs text-muted-foreground">19:00 - 23:00</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <div className="relative w-24">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">+S/</span>
                    <Input
                      type="number"
                      placeholder="5"
                      className="h-10 pl-10"
                      value={editPriceData.nightExtra}
                      onChange={(e) => setEditPriceData(prev => ({ ...prev, nightExtra: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Vaso Promo */}
          {field.hasFullVaso && (
            <div>
              <Label htmlFor="editPromoDesc">Promoción Full Vaso</Label>
              <Textarea
                id="editPromoDesc"
                placeholder="Descripción de la promoción Full Vaso"
                className="min-h-24"
                value={editPriceData.promoDescription}
                onChange={(e) => setEditPriceData(prev => ({ ...prev, promoDescription: e.target.value }))}
              />
            </div>
          )}

          {/* Price Preview */}
          <div className="bg-secondary rounded-lg p-4">
            <h4 className="mb-2">Vista Previa de Precios</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precio Base:</span>
                <span>S/ {editPriceData.basePrice || '0'}/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fin de Semana:</span>
                <span>S/ {(Number(editPriceData.basePrice) + Number(editPriceData.weekendExtra || 0)) || '0'}/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Noche:</span>
                <span>S/ {(Number(editPriceData.basePrice) + Number(editPriceData.nightExtra || 0)) || '0'}/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
            disabled={saving}
            onClick={onSave}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
