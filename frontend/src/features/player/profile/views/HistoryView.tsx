import { Separator } from "../../../../components/ui/separator";
import { SectionHeader } from "../components/SectionHeader";
import { BookingHistory, MatchStats } from "../types";

interface HistoryViewProps {
  onBack: () => void;
}

// Mock data - would come from API
const MOCK_BOOKINGS: BookingHistory[] = [
  { field: 'Canchita La Merced', date: '8 Oct 2024', price: 35 },
  { field: 'Estadio Zona Sur', date: '1 Oct 2024', price: 45 },
  { field: 'Cancha Los Pinos', date: '25 Sep 2024', price: 40 }
];

const MOCK_STATS: MatchStats = {
  total: 24,
  won: 15,
  lost: 9
};

export function HistoryView({ onBack }: HistoryViewProps) {
  return (
    <div className="min-h-screen bg-white pb-20">
      <SectionHeader title="Historial" onBack={onBack} />

      <div className="p-4 space-y-6">
        {/* Booking History */}
        <div>
          <h3 className="mb-3">Reservas Anteriores</h3>
          <div className="space-y-3">
            {MOCK_BOOKINGS.map((booking, index) => (
              <BookingCard key={index} booking={booking} />
            ))}
          </div>
        </div>

        <Separator />

        {/* Match Stats */}
        <div>
          <h3 className="mb-3">Historial de Partidos</h3>
          <MatchStatsGrid stats={MOCK_STATS} />
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: BookingHistory }) {
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4>{booking.field}</h4>
        <span className="text-[#047857]">S/ {booking.price}</span>
      </div>
      <p className="text-sm text-muted-foreground">{booking.date}</p>
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
