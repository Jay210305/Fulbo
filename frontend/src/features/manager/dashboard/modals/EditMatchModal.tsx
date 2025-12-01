import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { format } from "date-fns";
import { EditMatchModalProps } from "../types";

export function EditMatchModal({ open, onClose, match, onSave }: EditMatchModalProps) {
  const [time, setTime] = useState(match ? format(new Date(match.startTime), 'HH:mm') : '');
  const [duration, setDuration] = useState('1h');
  const [paymentStatus, setPaymentStatus] = useState(match?.paymentStatus || 'pending');

  if (!match) return null;

  const handleSave = () => {
    onSave({
      ...match,
      paymentStatus: paymentStatus as 'pending' | 'succeeded' | 'failed'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Reserva</DialogTitle>
          <DialogDescription>
            Modifica los detalles de la reserva de {match.customer?.name || 'Cliente'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Hora de Inicio</Label>
            <Input 
              type="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div>
            <Label>Duración</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hora</SelectItem>
                <SelectItem value="1.5h">1.5 horas</SelectItem>
                <SelectItem value="2h">2 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Estado de Pago</Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="succeeded">Pagado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="failed">Fallido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            className="bg-[#047857] hover:bg-[#047857]/90"
            onClick={handleSave}
          >
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
