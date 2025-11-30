import { X } from "lucide-react";
import { Button } from "../../../../components/ui/button";
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
import { FieldDisplay, BulkEditForm } from "../types";

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: FieldDisplay[];
  selectedFieldsForBulk: string[];
  setSelectedFieldsForBulk: React.Dispatch<React.SetStateAction<string[]>>;
  bulkEditData: BulkEditForm;
  setBulkEditData: React.Dispatch<React.SetStateAction<BulkEditForm>>;
  onApply: () => void;
}

export function BulkEditModal({
  isOpen,
  onClose,
  fields,
  selectedFieldsForBulk,
  setSelectedFieldsForBulk,
  bulkEditData,
  setBulkEditData,
  onApply
}: BulkEditModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedFieldsForBulk([]);
    onClose();
  };

  const toggleFieldSelection = (fieldId: string, checked: boolean) => {
    setSelectedFieldsForBulk(prev =>
      checked
        ? [...prev, fieldId]
        : prev.filter(id => id !== fieldId)
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
          <h2>Edición Masiva</h2>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Field Selection */}
          <div>
            <Label>Selecciona Canchas</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Marca las canchas que deseas modificar
            </p>
            <div className="space-y-2">
              {fields.map((field) => (
                <div 
                  key={field.id} 
                  className="flex items-center space-x-3 p-3 border border-border rounded-lg"
                >
                  <Checkbox
                    id={`bulk-${field.id}`}
                    checked={selectedFieldsForBulk.includes(field.id)}
                    onCheckedChange={(checked: boolean) => toggleFieldSelection(field.id, checked)}
                  />
                  <Label htmlFor={`bulk-${field.id}`} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span>{field.name}</span>
                      <span className="text-sm text-muted-foreground">S/ {field.price}/h</span>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Bulk Edit Options (only show when fields are selected) */}
          {selectedFieldsForBulk.length > 0 && (
            <>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-sm">
                  <strong>{selectedFieldsForBulk.length}</strong> canchas seleccionadas
                </p>
              </div>

              {/* Price Adjustment */}
              <div>
                <Label>Ajustar Precio</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Select
                    value={bulkEditData.adjustmentType}
                    onValueChange={(value: 'percentage' | 'fixed') =>
                      setBulkEditData(prev => ({ ...prev, adjustmentType: value }))
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                      <SelectItem value="fixed">Monto Fijo (S/)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder={bulkEditData.adjustmentType === 'percentage' ? '±10' : '±5.00'}
                    className="h-12"
                    value={bulkEditData.priceAdjustment}
                    onChange={(e) => setBulkEditData(prev => ({ ...prev, priceAdjustment: e.target.value }))}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Usa números positivos para aumentar y negativos para reducir
                </p>
              </div>

              {/* Status Change */}
              <div>
                <Label>Cambiar Estado</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button variant="outline" className="h-12">
                    Activar
                  </Button>
                  <Button variant="outline" className="h-12">
                    Mantenimiento
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-[#047857] hover:bg-[#047857]/90"
            onClick={() => {
              onApply();
              handleClose();
            }}
            disabled={selectedFieldsForBulk.length === 0}
          >
            Aplicar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
