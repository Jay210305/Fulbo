import { Percent, Gift, Clock, Calendar } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Calendar as CalendarComponent } from '../../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Field, NewPromotionForm, PromotionType } from '../types';

interface PromotionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  fields: Field[];
  formData: NewPromotionForm;
  onFieldChange: (field: keyof NewPromotionForm, value: string | Date | undefined | PromotionType) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function PromotionFormModal({
  open,
  onOpenChange,
  isEdit,
  fields,
  formData,
  onFieldChange,
  onSubmit,
  onCancel,
}: PromotionFormModalProps) {
  const isFormValid =
    formData.name &&
    formData.description &&
    formData.value &&
    formData.field &&
    formData.startDate &&
    formData.endDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Promoción' : 'Crear Nueva Promoción'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualiza los detalles de la promoción'
              : 'Configura una oferta especial para atraer más clientes'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo de Promoción *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: string) => onFieldChange('type', value as PromotionType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount">
                  <div className="flex items-center gap-2">
                    <Percent size={16} />
                    <span>Descuento Porcentual</span>
                  </div>
                </SelectItem>
                <SelectItem value="2x1">
                  <div className="flex items-center gap-2">
                    <Gift size={16} />
                    <span>2x1 en Reservas</span>
                  </div>
                </SelectItem>
                <SelectItem value="happyhour">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Happy Hour (Horas Específicas)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nombre de la Promoción *</Label>
            <Input
              value={formData.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              placeholder="Ej: 10% OFF"
            />
          </div>

          <div className="space-y-2">
            <Label>Descripción *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              placeholder="Describe los detalles de la promoción"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Valor del Descuento *</Label>
            <div className="flex gap-2">
              <Input
                value={formData.value}
                onChange={(e) => onFieldChange('value', e.target.value)}
                placeholder="10"
                type="number"
                className="flex-1"
              />
              <div className="w-16 h-10 bg-muted rounded-lg flex items-center justify-center">
                {formData.type === '2x1' ? '2x1' : '%'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cancha Aplicable *</Label>
            <Select
              value={formData.field}
              onValueChange={(value: string) => onFieldChange('field', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cancha..." />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field.id} value={field.name}>
                    {field.name} ({field.type})
                  </SelectItem>
                ))}
                <SelectItem value="all">Todas las canchas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Fecha de Inicio *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <Calendar size={16} className="mr-2" />
                    {formData.startDate
                      ? format(formData.startDate, 'd MMM', { locale: es })
                      : 'Elegir'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date: Date | undefined) => onFieldChange('startDate', date)}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha de Fin *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <Calendar size={16} className="mr-2" />
                    {formData.endDate
                      ? format(formData.endDate, 'd MMM', { locale: es })
                      : 'Elegir'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date: Date | undefined) => onFieldChange('endDate', date)}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            className="bg-[#047857] hover:bg-[#047857]/90"
            disabled={!isFormValid}
          >
            {isEdit ? 'Guardar Cambios' : 'Publicar Promoción'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
