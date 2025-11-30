import { ArrowLeft } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { MatchInfoCard, TeamLevelSelector } from "../components";
import type { TeamLevel } from "../types";

interface PlayersSearchViewProps {
  matchName: string;
  fieldName: string;
  date: string;
  time: string;
  teamLevel: TeamLevel;
  setTeamLevel: (value: TeamLevel) => void;
  teamName: string;
  setTeamName: (value: string) => void;
  playersNeeded: string;
  setPlayersNeeded: (value: string) => void;
  positionNeeded: string;
  setPositionNeeded: (value: string) => void;
  playersMessage: string;
  setPlayersMessage: (value: string) => void;
  onBack: () => void;
  onPublish: () => void;
}

export function PlayersSearchView({
  matchName,
  fieldName,
  date,
  time,
  teamLevel,
  setTeamLevel,
  teamName,
  setTeamName,
  playersNeeded,
  setPlayersNeeded,
  positionNeeded,
  setPositionNeeded,
  playersMessage,
  setPlayersMessage,
  onBack,
  onPublish
}: PlayersSearchViewProps) {
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>Completar mi Equipo</h2>
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
            idSuffix="-p"
          />

          <div>
            <Label htmlFor="players-needed">Jugadores Faltantes *</Label>
            <Select value={playersNeeded} onValueChange={setPlayersNeeded}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="¿Cuántos jugadores necesitas?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 jugador</SelectItem>
                <SelectItem value="2">2 jugadores</SelectItem>
                <SelectItem value="3">3 jugadores</SelectItem>
                <SelectItem value="4">4 jugadores</SelectItem>
                <SelectItem value="5">5 jugadores</SelectItem>
                <SelectItem value="6">6+ jugadores</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="position-needed">Posición Faltante (Opcional)</Label>
            <Select value={positionNeeded} onValueChange={setPositionNeeded}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecciona una posición" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cualquier">Cualquier posición</SelectItem>
                <SelectItem value="Arquero">Arquero</SelectItem>
                <SelectItem value="Defensa">Defensa</SelectItem>
                <SelectItem value="Mediocampista">Mediocampista</SelectItem>
                <SelectItem value="Delantero">Delantero</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="players-message">Mensaje para Jugadores *</Label>
            <Textarea
              id="players-message"
              value={playersMessage}
              onChange={(e) => setPlayersMessage(e.target.value)}
              placeholder="Ej: Nos falta un 5 que corra como loco"
              className="mt-2 min-h-[100px]"
            />
          </div>
        </div>

        <Button
          onClick={onPublish}
          className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
        >
          Publicar Búsqueda de Integrantes
        </Button>
      </div>
    </div>
  );
}
