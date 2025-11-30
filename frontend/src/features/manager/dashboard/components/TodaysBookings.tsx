import { Calendar, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { format } from "date-fns";
import { TodaysBookingsProps } from "../types";

export function TodaysBookings({ bookings, loading, onViewAll }: TodaysBookingsProps) {
  const formatBookingTime = (startTime: string) => {
    return format(new Date(startTime), 'HH:mm');
  };

  const getBookingDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${hours}h`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3>Partidos de Hoy</h3>
        <Button
          variant="link"
          className="text-[#047857] p-0 h-auto"
          onClick={onViewAll}
        >
          Ver Todo
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#047857]" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay reservas para hoy</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-lg">{formatBookingTime(booking.startTime)}</p>
                    <p className="text-xs text-muted-foreground">
                      {getBookingDuration(booking.startTime, booking.endTime)}
                    </p>
                  </div>
                  <div>
                    <p>{booking.customer?.name || 'Cliente'}</p>
                    <p className="text-sm text-muted-foreground">{booking.fieldName}</p>
                  </div>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BookingStatusBadge({ status }: { status: string }) {
  if (status === 'confirmed') {
    return (
      <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
        Confirmado
      </Badge>
    );
  }
  if (status === 'cancelled') {
    return <Badge variant="destructive">Cancelado</Badge>;
  }
  return <Badge variant="secondary">Pendiente</Badge>;
}
