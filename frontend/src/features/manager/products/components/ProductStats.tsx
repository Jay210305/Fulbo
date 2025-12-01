interface ProductStatsProps {
  total: number;
  active: number;
  inactive: number;
}

export function ProductStats({ total, active, inactive }: ProductStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-muted rounded-lg p-3 text-center">
        <p className="text-xl text-[#047857] mb-1">{active}</p>
        <p className="text-xs text-muted-foreground">Activos</p>
      </div>
      <div className="bg-muted rounded-lg p-3 text-center">
        <p className="text-xl text-[#047857] mb-1">{total}</p>
        <p className="text-xs text-muted-foreground">Total</p>
      </div>
      <div className="bg-muted rounded-lg p-3 text-center">
        <p className="text-xl text-[#047857] mb-1">{inactive}</p>
        <p className="text-xs text-muted-foreground">Inactivos</p>
      </div>
    </div>
  );
}
