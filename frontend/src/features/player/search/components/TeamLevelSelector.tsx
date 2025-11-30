import { TrendingUp } from "lucide-react";
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import { RadioGroup, RadioGroupItem } from "../../../../components/ui/radio-group";
import type { TeamLevel } from "../types";
import { LEVEL_DESCRIPTIONS } from "../types";

interface TeamLevelSelectorProps {
  value: TeamLevel;
  onChange: (value: TeamLevel) => void;
  teamName: string;
  onTeamNameChange: (value: string) => void;
  idSuffix?: string;
}

export function TeamLevelSelector({
  value,
  onChange,
  teamName,
  onTeamNameChange,
  idSuffix = ''
}: TeamLevelSelectorProps) {
  return (
    <div className="border-2 border-[#047857] rounded-xl p-4 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={20} className="text-[#047857]" />
        <h3>Define el Nivel de tu Búsqueda</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Nivel de tu Equipo *</Label>
          <RadioGroup 
            value={value} 
            onValueChange={(v: string) => onChange(v as TeamLevel)} 
            className="mt-3 space-y-3"
          >
            {(['principiante', 'intermedio', 'avanzado'] as TeamLevel[]).map((level) => (
              <div 
                key={level}
                className="flex items-start space-x-3 p-3 border-2 rounded-lg border-border hover:border-[#047857] transition-colors"
              >
                <RadioGroupItem value={level} id={`level-${level}${idSuffix}`} className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor={`level-${level}${idSuffix}`} className="cursor-pointer">
                    <span className="block mb-1">{LEVEL_DESCRIPTIONS[level].label}</span>
                    <span className="text-sm text-muted-foreground">
                      {LEVEL_DESCRIPTIONS[level].description}
                    </span>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor={`team-name${idSuffix}`}>Nombre del Equipo (Opcional)</Label>
          <Input
            id={`team-name${idSuffix}`}
            value={teamName}
            onChange={(e) => onTeamNameChange(e.target.value)}
            placeholder="Ej: Los Buitres F.C."
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}
