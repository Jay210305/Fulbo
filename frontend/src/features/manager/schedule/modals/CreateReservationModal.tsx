import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
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
import { Field, NewReservationForm } from '../types';

interface CreateReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: Field[];
  newReservation: NewReservationForm;
  onReservationChange: (reservation: NewReservationForm) => void;
  onCreateReservation: () => void;
}

export function CreateReservationModal({
  open,
  onOpenChange,
  fields,
  newReservation,
  onReservationChange,
  onCreateReservation,
}: CreateReservationModalProps) {
  const isFormValid =
    newReservation.field &&
    newReservation.time &&
    newReservation.duration &&
    newReservation.customerName &&
    newReservation.customerPhone;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Reserva Manual</DialogTitle>
          <DialogDescription>Registra una nueva reserva manualmente</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Cancha *</Label>
            <Select
              value={newReservation.field}
              onValueChange={(value: string) =>
                onReservationChange({ ...newReservation, field: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cancha..." />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field.id} value={field.name}>
                    {field.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Hora *</Label>
              <Input
                type="time"
                value={newReservation.time}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onReservationChange({ ...newReservation, time: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Duración *</Label>
              <Select
                value={newReservation.duration}
                onValueChange={(value: string) =>
                  onReservationChange({ ...newReservation, duration: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Duración" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 hora</SelectItem>
                  <SelectItem value="1.5h">1.5 horas</SelectItem>
                  <SelectItem value="2h">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nombre del Cliente *</Label>
            <Input
              value={newReservation.customerName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onReservationChange({ ...newReservation, customerName: e.target.value })
              }
              placeholder="Nombre completo"
            />
          </div>

          <div className="space-y-2">
            <Label>Teléfono *</Label>
            <Input
              type="tel"
              value={newReservation.customerPhone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onReservationChange({ ...newReservation, customerPhone: e.target.value })
              }
              placeholder="+51 987 654 321"
            />
          </div>

          <div className="space-y-2">
            <Label>Email (Opcional)</Label>
            <Input
              type="email"
              value={newReservation.customerEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onReservationChange({ ...newReservation, customerEmail: e.target.value })
              }
              placeholder="cliente@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Estado de Pago *</Label>
            <Select
              value={newReservation.paymentStatus}
              onValueChange={(value: string) =>
                onReservationChange({
                  ...newReservation,
                  paymentStatus: value as 'paid' | 'pending',
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onCreateReservation}
            className="bg-[#047857] hover:bg-[#047857]/90"
            disabled={!isFormValid}
          >
            Crear Reserva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
