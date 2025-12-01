import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AvailabilityModal({ isOpen, onClose }: AvailabilityModalProps) {
  if (!isOpen) return null;

  const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const dayLetters = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
          <h2>Configurar Disponibilidad</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Calendar View */}
          <div>
            <Label>Calendario de Bloqueos</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Selecciona fechas para gestionar disponibilidad
            </p>
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4>Octubre 2025</h4>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <ChevronLeft size={16} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {dayLetters.map((day) => (
                  <div key={day} className="text-muted-foreground py-2">{day}</div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    className={`py-2 rounded-lg hover:bg-muted ${
                      day === 15 ? 'bg-[#047857] text-white' : ''
                    } ${day === 20 || day === 25 ? 'bg-red-100 text-red-600' : ''}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time Blocking */}
          <div>
            <Label>Bloquear Período</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Define horarios no disponibles para la fecha seleccionada
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="blockStart" className="text-sm">Desde</Label>
                  <Input id="blockStart" type="time" className="h-12" />
                </div>
                <div>
                  <Label htmlFor="blockEnd" className="text-sm">Hasta</Label>
                  <Input id="blockEnd" type="time" className="h-12" />
                </div>
              </div>
              <div>
                <Label htmlFor="blockReason">Motivo del Bloqueo</Label>
                <Select>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Seleccionar motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="uso_personal">Uso Personal</SelectItem>
                    <SelectItem value="evento_privado">Evento Privado</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-[#047857] hover:bg-[#047857]/90">
                Aplicar Bloqueo
              </Button>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <Label>Horario Fijo de Operación</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Define el horario general de apertura y cierre
            </p>
            <div className="space-y-3">
              {weekDays.map((day) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-24 text-sm">{day}</span>
                  <Input type="time" defaultValue="08:00" className="h-10" />
                  <span className="text-muted-foreground">-</span>
                  <Input type="time" defaultValue="23:00" className="h-10" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border p-4">
          <Button
            className="w-full bg-[#047857] hover:bg-[#047857]/90"
            onClick={onClose}
          >
            Guardar Configuración
          </Button>
        </div>
      </div>
    </div>
  );
}
