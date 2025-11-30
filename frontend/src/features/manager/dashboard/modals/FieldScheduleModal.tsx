import { X, Calendar, Clock, User, Phone, Edit, MessageCircle } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FieldScheduleModalProps, ManagerBooking } from "../types";

export function FieldScheduleModal({
  open,
  onClose,
  field,
  bookings,
  onEditMatch,
  onContactMatch
}: FieldScheduleModalProps) {
  if (!open || !field) return null;

  const fieldBookings = bookings.filter(b => b.fieldId === field.id);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between z-10">
          <div>
            <h2>Horario - {field.name}</h2>
            <p className="text-sm text-muted-foreground">Reservas de hoy</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Calendar Info */}
        <div className="p-4 bg-secondary border-b border-border">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-[#047857]" />
            <span>{format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</span>
          </div>
        </div>

        {/* Schedule Content */}
        <div className="p-4 space-y-4">
          {fieldBookings.length === 0 ? (
            <EmptySchedule />
          ) : (
            <>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-sm">
                  <strong>{fieldBookings.length}</strong> reserva{fieldBookings.length !== 1 ? 's' : ''} programada{fieldBookings.length !== 1 ? 's' : ''}
                </p>
              </div>

              {fieldBookings.map((booking) => (
                <MatchCard
                  key={booking.id}
                  booking={booking}
                  onEdit={() => onEditMatch(booking)}
                  onContact={() => onContactMatch(booking)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptySchedule() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
        <Calendar size={32} className="text-muted-foreground" />
      </div>
      <h4 className="mb-2">No hay reservas para hoy</h4>
      <p className="text-sm text-muted-foreground">
        Esta cancha no tiene reservas programadas para el día de hoy
      </p>
    </div>
  );
}

interface MatchCardProps {
  booking: ManagerBooking;
  onEdit: () => void;
  onContact: () => void;
}

function MatchCard({ booking, onEdit, onContact }: MatchCardProps) {
  const time = format(new Date(booking.startTime), 'HH:mm');
  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  const duration = `${hours}h`;
  const customerName = booking.customer?.name || 'Cliente';
  const customerPhone = booking.customer?.phone || '-';
  const teams = `${customerName} - ${booking.fieldName}`;

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      {/* Match Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#047857] rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock size={20} className="text-white" />
          </div>
          <div>
            <h4 className="mb-1">{teams}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{time}</span>
              <span>•</span>
              <span>{duration}</span>
            </div>
          </div>
        </div>
        {booking.status === 'confirmed' ? (
          <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
            Confirmado
          </Badge>
        ) : (
          <Badge variant="secondary">Pendiente</Badge>
        )}
      </div>

      {/* Customer Info */}
      <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <User size={14} className="text-muted-foreground" />
          <span>{customerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-muted-foreground" />
          <span>{customerPhone}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onEdit}
        >
          <Edit size={14} className="mr-2" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onContact}
        >
          <MessageCircle size={14} className="mr-2" />
          Contactar
        </Button>
      </div>
    </div>
  );
}
