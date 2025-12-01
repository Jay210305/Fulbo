interface FieldStatsProps {
  activeCount: number;
  totalRevenue: number;
  totalBookings: number;
}

export function FieldStats({ activeCount, totalRevenue, totalBookings }: FieldStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-muted rounded-lg p-3 text-center">
        <p className="text-xl text-[#047857] mb-1">{activeCount}</p>
        <p className="text-xs text-muted-foreground">Canchas Activas</p>
      </div>
      <div className="bg-muted rounded-lg p-3 text-center">
        <p className="text-xl text-[#047857] mb-1">S/ {totalRevenue.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">Ingresos Total</p>
      </div>
      <div className="bg-muted rounded-lg p-3 text-center">
        <p className="text-xl text-[#047857] mb-1">{totalBookings}</p>
        <p className="text-xs text-muted-foreground">Reservas</p>
      </div>
    </div>
  );
}
