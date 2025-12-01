import { Percent, DollarSign } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import type { NewPromotionForm, Promotion, PromotionDiscountType } from "../types";

interface PromotionFormFieldsProps {
  data: NewPromotionForm | Promotion;
  onChange: (data: NewPromotionForm | Promotion) => void;
  isEdit?: boolean;
}

export function PromotionFormFields({ data, onChange, isEdit = false }: PromotionFormFieldsProps) {
  const discountType = 'discountType' in data ? data.discountType : 'percentage';
  const discountValue = 'discountValue' in data 
    ? (typeof data.discountValue === 'number' ? data.discountValue.toString() : data.discountValue)
    : '';

  const formatDateValue = (value: string): string => {
    if (typeof value === 'string' && value.includes('T')) {
      return value.split('T')[0];
    }
    return value;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="promoTitle">Título de la Promoción *</Label>
        <Input
          id="promoTitle"
          placeholder="Ej: 10% OFF, 2x1 los Martes"
          className="h-12"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="promoType">Tipo de Descuento *</Label>
        <Select
          value={discountType}
          onValueChange={(value: string) => onChange({ ...data, discountType: value as PromotionDiscountType })}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">
              <div className="flex items-center gap-2">
                <Percent size={14} />
                <span>Descuento Porcentual (%)</span>
              </div>
            </SelectItem>
            <SelectItem value="fixed_amount">
              <div className="flex items-center gap-2">
                <DollarSign size={14} />
                <span>Monto Fijo (S/)</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="promoValue">Valor del Descuento *</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {discountType === 'percentage' ? '%' : 'S/'}
          </span>
          <Input
            id="promoValue"
            type="number"
            placeholder={discountType === 'percentage' ? '10' : '15.00'}
            className="h-12 pl-10"
            value={discountValue}
            onChange={(e) => onChange({ 
              ...data, 
              discountValue: isEdit ? parseFloat(e.target.value) : e.target.value 
            } as NewPromotionForm | Promotion)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="promoDescription">Descripción</Label>
        <Textarea
          id="promoDescription"
          placeholder="Describe los detalles de la promoción"
          className="min-h-24"
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Fecha de Inicio *</Label>
          <Input
            id="startDate"
            type="date"
            className="h-12"
            value={formatDateValue(data.startDate)}
            onChange={(e) => onChange({ ...data, startDate: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="endDate">Fecha de Fin *</Label>
          <Input
            id="endDate"
            type="date"
            className="h-12"
            value={formatDateValue(data.endDate)}
            onChange={(e) => onChange({ ...data, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-3">
        <p className="text-sm">
          <strong>Nota:</strong> Las promociones aparecerán automáticamente en el home de todos los usuarios de Fulbo durante las fechas seleccionadas.
        </p>
      </div>
    </div>
  );
}
