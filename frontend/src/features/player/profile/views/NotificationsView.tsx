import { Bell, BellOff } from "lucide-react";
import { Switch } from "../../../../components/ui/switch";
import { SectionHeader } from "../components/SectionHeader";
import { NotificationSettings } from "../types";

interface NotificationsViewProps {
  onBack: () => void;
  notifications: NotificationSettings;
  onUpdateNotification: (key: keyof NotificationSettings, value: boolean) => void;
}

interface NotificationItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function NotificationItem({ icon, title, description, checked, onCheckedChange }: NotificationItemProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p>{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function NotificationsView({ 
  onBack, 
  notifications, 
  onUpdateNotification 
}: NotificationsViewProps) {
  return (
    <div className="min-h-screen bg-white pb-20">
      <SectionHeader title="Notificaciones" onBack={onBack} />

      <div className="p-4 space-y-1">
        <NotificationItem
          icon={<Bell size={20} className="text-[#047857]" />}
          title="Reservas"
          description="Confirmaciones y recordatorios"
          checked={notifications.reservations}
          onCheckedChange={(checked) => onUpdateNotification('reservations', checked)}
        />

        <NotificationItem
          icon={<Bell size={20} className="text-[#047857]" />}
          title="Chats"
          description="Mensajes de partidos y equipos"
          checked={notifications.chats}
          onCheckedChange={(checked) => onUpdateNotification('chats', checked)}
        />

        <NotificationItem
          icon={<BellOff size={20} className="text-muted-foreground" />}
          title="Promociones"
          description="Ofertas y descuentos especiales"
          checked={notifications.promotions}
          onCheckedChange={(checked) => onUpdateNotification('promotions', checked)}
        />
      </div>
    </div>
  );
}
