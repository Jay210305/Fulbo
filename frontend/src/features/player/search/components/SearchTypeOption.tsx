import { Trophy, Users } from "lucide-react";

interface SearchTypeOptionProps {
  type: 'rival' | 'players';
  onClick: () => void;
}

const OPTIONS = {
  rival: {
    icon: Trophy,
    title: 'Buscar un Equipo Rival',
    description: 'Encuentra otro equipo para enfrentarse en un partido amistoso'
  },
  players: {
    icon: Users,
    title: 'Completar mi Equipo',
    description: 'Busca jugadores para completar los espacios faltantes'
  }
};

export function SearchTypeOption({ type, onClick }: SearchTypeOptionProps) {
  const option = OPTIONS[type];
  const Icon = option.icon;

  return (
    <div
      onClick={onClick}
      className="border-2 border-border rounded-xl p-5 cursor-pointer hover:border-[#047857] hover:bg-secondary transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#047857] rounded-full flex items-center justify-center flex-shrink-0">
          <Icon size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <h4 className="mb-1">{option.title}</h4>
          <p className="text-sm text-muted-foreground">
            {option.description}
          </p>
        </div>
      </div>
    </div>
  );
}
