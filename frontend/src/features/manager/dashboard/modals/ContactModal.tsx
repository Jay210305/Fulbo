import { User, Phone, Mail } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { ContactModalProps } from "../types";

export function ContactModal({ open, onClose, match }: ContactModalProps) {
  if (!match) return null;

  const customerName = match.customer?.name || 'Cliente';
  const customerPhone = match.customer?.phone || '-';
  const customerEmail = match.customer?.email || '-';

  const handleCall = () => {
    if (customerPhone !== '-') {
      window.location.href = `tel:${customerPhone}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contactar Cliente</DialogTitle>
          <DialogDescription>
            Información de contacto de {customerName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <User size={20} className="text-[#047857]" />
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p>{customerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Phone size={20} className="text-[#047857]" />
            <div>
              <p className="text-sm text-muted-foreground">Teléfono</p>
              <p>{customerPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Mail size={20} className="text-[#047857]" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{customerEmail}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button 
            className="bg-[#047857] hover:bg-[#047857]/90"
            onClick={handleCall}
            disabled={customerPhone === '-'}
          >
            <Phone size={16} className="mr-2" />
            Llamar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
