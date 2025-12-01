import { ArrowLeft } from "lucide-react";
import { MatchInfoCard, SearchTypeOption } from "../components";
import type { SearchType } from "../types";

interface SelectionViewProps {
  matchName: string;
  fieldName: string;
  date: string;
  time: string;
  onBack: () => void;
  onSelectType: (type: SearchType) => void;
}

export function SelectionView({
  matchName,
  fieldName,
  date,
  time,
  onBack,
  onSelectType
}: SelectionViewProps) {
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>Configurar Búsqueda</h2>
      </div>

      <div className="p-4 space-y-6">
        <MatchInfoCard
          matchName={matchName}
          fieldName={fieldName}
          date={date}
          time={time}
        />

        <div>
          <h3 className="mb-4">¿Qué necesitas para tu partido?</h3>

          <div className="space-y-3">
            <SearchTypeOption type="rival" onClick={() => onSelectType('rival')} />
            <SearchTypeOption type="players" onClick={() => onSelectType('players')} />
          </div>
        </div>
      </div>
    </div>
  );
}
