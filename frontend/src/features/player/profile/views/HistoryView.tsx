import { Separator } from "../../../../components/ui/separator";
import { SectionHeader } from "../components/SectionHeader";
import { useBookingHistory, BookingHistoryItem, MatchStats } from "../hooks/useBookingHistory";

interface HistoryViewProps {
  onBack: () => void;
}

export function HistoryView({ onBack }: HistoryViewProps) {
  const { bookings, stats, loading, error } = useBookingHistory();

  return (
    <div className="min-h-screen bg-white pb-20">
      <SectionHeader title="Historial" onBack={onBack} />

      <div className="p-4 space-y-6">
        {/* Booking History */}
        <div>
          <h3 className="mb-3">Reservas Anteriores</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#047857]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tienes reservas anteriores
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Match Stats */}
        <div>
          <h3 className="mb-3">Historial de Partidos</h3>
          <MatchStatsGrid stats={stats} />
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: BookingHistoryItem }) {
  const statusColors = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    confirmed: 'Confirmada',
    pending: 'Pendiente',
    cancelled: 'Cancelada'
  };

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4>{booking.field}</h4>
        <span className="text-[#047857]">S/ {booking.price}</span>
      </div>
      <p className="text-sm text-muted-foreground">{booking.address}</p>
      <div className="flex items-center justify-between mt-2">
        <p className="text-sm text-muted-foreground">{booking.date} • {booking.time}</p>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[booking.status]}`}>
          {statusLabels[booking.status]}
        </span>
      </div>
    </div>
  );
}

function MatchStatsGrid({ stats }: { stats: MatchStats }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <StatBox value={stats.total} label="Partidos" />
      <StatBox value={stats.won} label="Ganados" />
      <StatBox value={stats.lost} label="Perdidos" />
    </div>
  );
}

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center p-4 bg-secondary rounded-lg">
      <p className="text-2xl text-[#047857] mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
