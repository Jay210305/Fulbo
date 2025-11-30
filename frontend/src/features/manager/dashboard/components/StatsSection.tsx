import { DollarSign, Calendar, Users, Loader2 } from "lucide-react";
import { StatsSectionProps, TimePeriod } from "../types";

const PERIOD_LABELS: Record<TimePeriod, string> = {
  today: 'Hoy',
  week: 'Esta Semana',
  month: 'Este Mes',
  custom: 'Periodo Personalizado'
};

export function StatsSection({ stats, loading, timePeriod }: StatsSectionProps) {
  const periodLabel = PERIOD_LABELS[timePeriod];

  return (
    <div>
      <h2 className="mb-4">Resumen de {periodLabel}</h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<DollarSign size={18} className="text-white" />}
          value={`S/ ${stats?.totalRevenue.toLocaleString() || 0}`}
          label="Ingresos"
          loading={loading}
        />

        <StatCard
          icon={<Calendar size={18} className="text-white" />}
          value={stats?.totalBookings || 0}
          label="Reservas Totales"
          loading={loading}
        />

        <StatCard
          icon={<Users size={18} className="text-white" />}
          value={stats?.uniqueCustomers || 0}
          label="Clientes"
          loading={loading}
        />

        <StatCard
          icon={<Calendar size={18} className="text-white" />}
          value={stats?.confirmedBookings || 0}
          label="Confirmadas"
          loading={loading}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  loading?: boolean;
}

function StatCard({ icon, value, label, loading }: StatCardProps) {
  return (
    <div className="bg-white border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 bg-[#047857] rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-[#047857]" />
      ) : (
        <p className="text-2xl mb-1">{value}</p>
      )}
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
