import { ArrowLeft, Plus, Shield } from "lucide-react";

interface StaffHeaderProps {
  onBack: () => void;
  onAdd: () => void;
}

export function StaffHeader({ onBack, onAdd }: StaffHeaderProps) {
  return (
    <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
      <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
        <ArrowLeft size={20} />
      </button>
      <div className="flex-1">
        <h2>Gestión de Empleados</h2>
        <p className="text-sm text-muted-foreground">Administra tu equipo de trabajo</p>
      </div>
      <button
        onClick={onAdd}
        className="w-10 h-10 bg-[#047857] hover:bg-[#047857]/90 rounded-full flex items-center justify-center text-white"
      >
        <Plus size={20} />
      </button>
    </div>
  );
}

export function AccessControlInfo() {
  return (
    <div className="bg-secondary border-2 border-[#047857] rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-[#047857] rounded-full flex items-center justify-center flex-shrink-0">
          <Shield size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h4 className="mb-1">Control de Acceso</h4>
          <p className="text-sm text-muted-foreground">
            Asigna permisos específicos a cada miembro de tu equipo para mantener la seguridad de tu negocio.
          </p>
        </div>
      </div>
    </div>
  );
}
