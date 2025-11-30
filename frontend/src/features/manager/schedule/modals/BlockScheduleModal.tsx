import { Ban, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
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
import { Field, NewBlockForm, BookingConflict, ScheduleBlockReason } from '../types';

interface BlockScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: Field[];
  loadingFields: boolean;
  newBlock: NewBlockForm;
  onBlockChange: (block: NewBlockForm) => void;
  blockError: string | null;
  bookingConflicts: BookingConflict[];
  savingBlock: boolean;
  onCreateBlock: () => void;
}

export function BlockScheduleModal({
  open,
  onOpenChange,
  fields,
  loadingFields,
  newBlock,
  onBlockChange,
  blockError,
  bookingConflicts,
  savingBlock,
  onCreateBlock,
}: BlockScheduleModalProps) {
  const isFormValid =
    newBlock.fieldId &&
    newBlock.startDate &&
    newBlock.startTime &&
    newBlock.endDate &&
    newBlock.endTime &&
    newBlock.reason;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban size={20} className="text-orange-500" />
            Bloquear Horario
          </DialogTitle>
          <DialogDescription>
            Bloquea un rango de tiempo para mantenimiento, eventos o cierre personal.
            Los jugadores no podrán reservar durante este período.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {blockError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700">{blockError}</p>
                  {bookingConflicts.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium text-red-600">Reservas en conflicto:</p>
                      {bookingConflicts.map((conflict) => (
                        <div key={conflict.bookingId} className="text-xs text-red-600">
                          • {conflict.customerName} -{' '}
                          {new Date(conflict.startTime).toLocaleString('es-ES')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Cancha *</Label>
            {loadingFields ? (
              <div className="flex items-center gap-2 p-2 text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Cargando canchas...</span>
              </div>
            ) : (
              <Select
                value={newBlock.fieldId}
                onValueChange={(value: string) => onBlockChange({ ...newBlock, fieldId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cancha..." />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Fecha Inicio *</Label>
              <Input
                type="date"
                value={newBlock.startDate}
                onChange={(e) => onBlockChange({ ...newBlock, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Hora Inicio *</Label>
              <Input
                type="time"
                value={newBlock.startTime}
                onChange={(e) => onBlockChange({ ...newBlock, startTime: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Fecha Fin *</Label>
              <Input
                type="date"
                value={newBlock.endDate}
                onChange={(e) => onBlockChange({ ...newBlock, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Hora Fin *</Label>
              <Input
                type="time"
                value={newBlock.endTime}
                onChange={(e) => onBlockChange({ ...newBlock, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Razón *</Label>
            <Select
              value={newBlock.reason}
              onValueChange={(value: string) =>
                onBlockChange({ ...newBlock, reason: value as ScheduleBlockReason })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar razón..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded bg-orange-500"></div>
                    Mantenimiento
                  </div>
                </SelectItem>
                <SelectItem value="personal">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded bg-purple-500"></div>
                    Personal / Cierre
                  </div>
                </SelectItem>
                <SelectItem value="event">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded bg-blue-500"></div>
                    Evento Privado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nota (Opcional)</Label>
            <Textarea
              value={newBlock.note}
              onChange={(e) => onBlockChange({ ...newBlock, note: e.target.value })}
              placeholder="Ej: Reparación de césped, Torneo corporativo..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onCreateBlock}
            className="bg-orange-500 hover:bg-orange-600"
            disabled={savingBlock || !isFormValid}
          >
            {savingBlock ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Ban size={16} className="mr-2" />
                Crear Bloqueo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
