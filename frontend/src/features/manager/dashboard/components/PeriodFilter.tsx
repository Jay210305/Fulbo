import { Button } from "../../../../components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PeriodFilterProps, TimePeriod } from "../types";

const PERIOD_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta Semana' },
  { value: 'month', label: 'Este Mes' },
];

export function PeriodFilter({ 
  timePeriod, 
  onPeriodChange, 
  onCustomClick, 
  dateRange 
}: PeriodFilterProps) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">Filtrar por periodo</p>
      <div className="flex gap-2">
        {PERIOD_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={timePeriod === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPeriodChange(option.value)}
            className={timePeriod === option.value ? 'bg-[#047857] hover:bg-[#047857]/90' : ''}
          >
            {option.label}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={onCustomClick}
        >
          Personalizar
        </Button>
      </div>
      {dateRange?.from && dateRange?.to && (
        <p className="text-xs text-muted-foreground mt-2">
          {format(dateRange.from, "d 'de' MMMM", { locale: es })} - {format(dateRange.to, "d 'de' MMMM, yyyy", { locale: es })}
        </p>
      )}
    </div>
  );
}
