import { Home, Search, MessageCircle, User, LayoutDashboard, Calendar, Megaphone } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  type?: 'player' | 'manager';
}

export function BottomNav({ activeTab, onTabChange, type = 'player' }: BottomNavProps) {
  const playerTabs = [
    { id: 'home', icon: Home, label: 'Canchas' },
    { id: 'search', icon: Search, label: 'Buscar' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'profile', icon: User, label: 'Perfil' }
  ];

  const managerTabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Resumen' },
    { id: 'fields', icon: Home, label: 'Canchas' },
    { id: 'schedule', icon: Calendar, label: 'Horarios' },
    { id: 'advertising', icon: Megaphone, label: 'Publicidad' },
    { id: 'profile', icon: User, label: 'Perfil' }
  ];

  const tabs = type === 'player' ? playerTabs : managerTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-2 py-2 safe-area-bottom">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors flex-1 ${
                isActive ? 'text-[#289B5F]' : 'text-muted-foreground'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs text-center leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
