import { User, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Match } from '../types';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: Match | null;
  onCallCustomer: (phone: string) => void;
  onEmailCustomer: (email: string) => void;
  onOpenChat: () => void;
}

export function ContactModal({
  open,
  onOpenChange,
  match,
  onCallCustomer,
  onEmailCustomer,
  onOpenChat,
}: ContactModalProps) {
  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Información de Contacto</DialogTitle>
          <DialogDescription>Detalles del cliente para esta reserva</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
            <div className="w-10 h-10 bg-[#047857] rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p>{match.customerName}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[#047857]" />
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="text-sm">{match.customerPhone || 'No disponible'}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCallCustomer(match.customerPhone)}
                disabled={!match.customerPhone}
              >
                Llamar
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#047857]" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm">{match.customerEmail || 'No disponible'}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEmailCustomer(match.customerEmail)}
                disabled={!match.customerEmail}
              >
                Enviar
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-[#047857]" />
                <div>
                  <p className="text-sm text-muted-foreground">Partido</p>
                  <p className="text-sm">{match.team}</p>
                  <p className="text-xs text-muted-foreground">
                    {match.field} • {match.time}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={onOpenChat} className="w-full bg-[#047857] hover:bg-[#047857]/90">
            <MessageCircle size={18} className="mr-2" />
            Abrir Chat de la App
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
