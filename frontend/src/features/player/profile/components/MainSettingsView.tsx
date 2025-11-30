import { ChevronRight, User, Users, Bell, History, CreditCard, HelpCircle, FileText, LogOut } from "lucide-react";
import { Separator } from "../../../../components/ui/separator";
import { SectionHeader } from "./SectionHeader";
import { ActiveSection } from "../types";

interface MainSettingsViewProps {
  onBack: () => void;
  onNavigate: (section: ActiveSection) => void;
}

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

function SettingItem({ icon, label, onClick, variant = 'default' }: SettingItemProps) {
  const baseClasses = "w-full flex items-center justify-between p-4 rounded-lg transition-colors";
  const variantClasses = variant === 'danger' 
    ? "hover:bg-red-50 text-red-500" 
    : "hover:bg-muted";

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {variant !== 'danger' && <ChevronRight size={20} />}
    </button>
  );
}

export function MainSettingsView({ onBack, onNavigate }: MainSettingsViewProps) {
  return (
    <div className="min-h-screen bg-white pb-20">
      <SectionHeader title="Configuración de Perfil" onBack={onBack} />

      <div className="p-4 space-y-6">
        {/* Mi Cuenta */}
        <div>
          <h3 className="mb-3 text-muted-foreground text-sm">MI CUENTA</h3>
          <div className="space-y-1">
            <SettingItem
              icon={<User size={20} className="text-[#047857]" />}
              label="Mi Perfil"
              onClick={() => onNavigate('profile')}
            />
            <SettingItem
              icon={<Users size={20} className="text-[#047857]" />}
              label="Mis Equipos"
              onClick={() => onNavigate('teams')}
            />
          </div>
        </div>

        <Separator />

        {/* Preferencias */}
        <div>
          <h3 className="mb-3 text-muted-foreground text-sm">PREFERENCIAS</h3>
          <div className="space-y-1">
            <SettingItem
              icon={<Bell size={20} className="text-[#047857]" />}
              label="Notificaciones"
              onClick={() => onNavigate('notifications')}
            />
          </div>
        </div>

        <Separator />

        {/* Actividad */}
        <div>
          <h3 className="mb-3 text-muted-foreground text-sm">ACTIVIDAD</h3>
          <div className="space-y-1">
            <SettingItem
              icon={<History size={20} className="text-[#047857]" />}
              label="Historial"
              onClick={() => onNavigate('history')}
            />
            <SettingItem
              icon={<CreditCard size={20} className="text-[#047857]" />}
              label="Pagos"
              onClick={() => onNavigate('payments')}
            />
          </div>
        </div>

        <Separator />

        {/* General */}
        <div>
          <h3 className="mb-3 text-muted-foreground text-sm">GENERAL</h3>
          <div className="space-y-1">
            <SettingItem
              icon={<HelpCircle size={20} className="text-[#047857]" />}
              label="Ayuda y Soporte"
              onClick={() => {}}
            />
            <SettingItem
              icon={<FileText size={20} className="text-[#047857]" />}
              label="Términos y Condiciones"
              onClick={() => {}}
            />
            <SettingItem
              icon={<LogOut size={20} />}
              label="Cerrar Sesión"
              onClick={() => {}}
              variant="danger"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
