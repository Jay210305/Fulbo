import { Ban, Plus } from 'lucide-react';

interface ScheduleHeaderProps {
  onOpenBlockModal: () => void;
  onOpenCreateModal: () => void;
}

export function ScheduleHeader({ onOpenBlockModal, onOpenCreateModal }: ScheduleHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl mb-1">Gestión de Horarios</h1>
        <p className="text-sm text-muted-foreground">Administra tus reservas y bloqueos</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onOpenBlockModal}
          className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg"
          title="Bloquear horario"
        >
          <Ban size={24} />
        </button>
        <button
          onClick={onOpenCreateModal}
          className="w-12 h-12 bg-[#047857] hover:bg-[#047857]/90 rounded-full flex items-center justify-center text-white shadow-lg"
          title="Crear reserva"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}
