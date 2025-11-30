import { Badge } from '../../../../components/ui/badge';

export function QuickFilters() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
      <Badge className="bg-[#047857] hover:bg-[#047857]/90 text-white border-none px-4 py-2">
        Hoy (8)
      </Badge>
      <Badge variant="outline" className="px-4 py-2">
        Mañana (6)
      </Badge>
      <Badge variant="outline" className="px-4 py-2">
        Esta Semana (42)
      </Badge>
      <Badge variant="outline" className="px-4 py-2">
        Este Mes (156)
      </Badge>
    </div>
  );
}
