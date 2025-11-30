import { Calendar } from '../../../../components/ui/calendar';

interface CalendarSectionProps {
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  dateHasBlocks: (date: Date) => boolean;
}

export function CalendarSection({ date, onDateSelect, dateHasBlocks }: CalendarSectionProps) {
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm">Seleccionar Fecha</p>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span>Bloqueado</span>
          </div>
        </div>
      </div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={onDateSelect}
        className="rounded-md border-0"
        modifiers={{
          blocked: (d: Date) => dateHasBlocks(d),
        }}
        modifiersStyles={{
          blocked: {
            backgroundColor: 'rgb(249 115 22 / 0.2)',
            borderRadius: '0.375rem',
          },
        }}
      />
    </div>
  );
}
