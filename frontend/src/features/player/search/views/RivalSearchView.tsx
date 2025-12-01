import { ArrowLeft } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { MatchInfoCard, TeamLevelSelector } from "../components";
import type { TeamLevel } from "../types";

interface RivalSearchViewProps {
  matchName: string;
  fieldName: string;
  date: string;
  time: string;
  teamLevel: TeamLevel;
  setTeamLevel: (value: TeamLevel) => void;
  teamName: string;
  setTeamName: (value: string) => void;
  rivalMessage: string;
  setRivalMessage: (value: string) => void;
  onBack: () => void;
  onPublish: () => void;
}

export function RivalSearchView({
  matchName,
  fieldName,
  date,
  time,
  teamLevel,
  setTeamLevel,
  teamName,
  setTeamName,
  rivalMessage,
  setRivalMessage,
  onBack,
  onPublish
}: RivalSearchViewProps) {
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>Buscar Equipo Rival</h2>
      </div>

      <div className="p-4 space-y-6">
        <MatchInfoCard
          matchName={matchName}
          fieldName={fieldName}
          date={date}
          time={time}
        />

        <div className="space-y-6">
          <TeamLevelSelector
            value={teamLevel}
            onChange={setTeamLevel}
            teamName={teamName}
            onTeamNameChange={setTeamName}
          />

          <div>
            <Label htmlFor="rival-message">Mensaje para el Rival *</Label>
            <Textarea
              id="rival-message"
              value={rivalMessage}
              onChange={(e) => setRivalMessage(e.target.value)}
              placeholder="Ej: Buscamos una pichanga relajada, ¡anímense!"
              className="mt-2 min-h-[100px]"
            />
          </div>
        </div>

        <Button
          onClick={onPublish}
          className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
        >
          Publicar Búsqueda de Rival
        </Button>
      </div>
    </div>
  );
}
