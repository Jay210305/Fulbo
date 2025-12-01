import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Calendar } from "../../../../components/ui/calendar";
import { es } from "date-fns/locale";
import { CustomDatePickerModalProps } from "../types";

export function CustomDatePickerModal({
  open,
  onClose,
  dateRange,
  onDateRangeChange,
  onApply
}: CustomDatePickerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Seleccionar Rango de Fechas</DialogTitle>
          <DialogDescription>
            Elige un periodo personalizado para ver las estadísticas
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(range: { from?: Date; to?: Date } | undefined) => onDateRangeChange(range || {})}
            numberOfMonths={1}
            locale={es}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-[#047857] hover:bg-[#047857]/90"
            onClick={onApply}
          >
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
