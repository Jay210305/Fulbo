import { useState } from "react";
import { ArrowLeft, Users, Trophy, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TeamLevel } from "../../types/field";
import { useUser } from "../../contexts/UserContext";
import { PhoneVerificationModal } from "./PhoneVerificationModal";

interface CreateSearchScreenProps {
  matchName: string;
  fieldName: string;
  date: string;
  time: string;
  preSelectedType?: 'rival' | 'players'; // Nueva prop para pre-seleccionar tipo
  onBack: () => void;
  onPublish: (type: 'rival' | 'players', data: any) => void;
}

export function CreateSearchScreen({ matchName, fieldName, date, time, preSelectedType, onBack, onPublish }: CreateSearchScreenProps) {
  const { requiresPhoneVerification, updateUser } = useUser();
  const [searchType, setSearchType] = useState<'rival' | 'players' | null>(preSelectedType || null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [pendingPublishType, setPendingPublishType] = useState<'rival' | 'players' | null>(null);
  
  // Common state
  const [teamLevel, setTeamLevel] = useState<TeamLevel>('intermedio');
  const [teamName, setTeamName] = useState('');
  
  // Rival search state
  const [rivalMessage, setRivalMessage] = useState('');
  
  // Players search state
  const [playersNeeded, setPlayersNeeded] = useState('');
  const [positionNeeded, setPositionNeeded] = useState('cualquier');
  const [playersMessage, setPlayersMessage] = useState('');

  const handlePublishRival = () => {
    if (!teamLevel || !rivalMessage.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Verificar teléfono antes de publicar
    if (requiresPhoneVerification()) {
      setPendingPublishType('rival');
      setShowPhoneModal(true);
      return;
    }

    proceedWithRivalPublish();
  };

  const proceedWithRivalPublish = () => {
    onPublish('rival', {
      teamLevel,
      teamName: teamName.trim() || undefined,
      message: rivalMessage
    });
  };

  const handlePublishPlayers = () => {
    if (!playersNeeded || !playersMessage.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Verificar teléfono antes de publicar
    if (requiresPhoneVerification()) {
      setPendingPublishType('players');
      setShowPhoneModal(true);
      return;
    }

    proceedWithPlayersPublish();
  };

  const proceedWithPlayersPublish = () => {
    onPublish('players', {
      teamLevel,
      teamName: teamName.trim() || undefined,
      playersNeeded: parseInt(playersNeeded),
      position: positionNeeded,
      message: playersMessage
    });
  };

  const handlePhoneVerified = (phone: string) => {
    updateUser({ phone, phoneVerified: true });
    setShowPhoneModal(false);
    
    // Continuar con la publicación según el tipo pendiente
    if (pendingPublishType === 'rival') {
      proceedWithRivalPublish();
    } else if (pendingPublishType === 'players') {
      proceedWithPlayersPublish();
    }
    setPendingPublishType(null);
  };

  if (searchType === 'rival') {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
          <button onClick={() => setSearchType(null)} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h2>Buscar Equipo Rival</h2>
        </div>

        <div className="p-4 space-y-6">
          {/* Match Info */}
          <div className="bg-secondary border border-[#047857] rounded-xl p-4">
            <h3 className="mb-2">{matchName}</h3>
            <p className="text-sm text-muted-foreground">{fieldName}</p>
            <p className="text-sm text-muted-foreground">{date} • {time}</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Team Level Section */}
            <div className="border-2 border-[#047857] rounded-xl p-4 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-[#047857]" />
                <h3>Define el Nivel de tu Búsqueda</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Nivel de tu Equipo *</Label>
                  <RadioGroup value={teamLevel} onValueChange={(value: string) => setTeamLevel(value as TeamLevel)} className="mt-3 space-y-3">
                    <div className="flex items-start space-x-3 p-3 border-2 rounded-lg border-border hover:border-[#047857] transition-colors">
                      <RadioGroupItem value="principiante" id="level-beginner" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="level-beginner" className="cursor-pointer">
                          <span className="block mb-1">Principiante</span>
                          <span className="text-sm text-muted-foreground">Fútbol social, sin presión</span>
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border-2 rounded-lg border-border hover:border-[#047857] transition-colors">
                      <RadioGroupItem value="intermedio" id="level-intermediate" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="level-intermediate" className="cursor-pointer">
                          <span className="block mb-1">Intermedio</span>
                          <span className="text-sm text-muted-foreground">Juego organizado, competitivo</span>
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border-2 rounded-lg border-border hover:border-[#047857] transition-colors">
                      <RadioGroupItem value="avanzado" id="level-advanced" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="level-advanced" className="cursor-pointer">
                          <span className="block mb-1">Avanzado</span>
                          <span className="text-sm text-muted-foreground">Alta intensidad, ligas locales</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="team-name">Nombre del Equipo (Opcional)</Label>
                  <Input
                    id="team-name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Ej: Los Buitres F.C."
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

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

          {/* Action Button */}
          <Button
            onClick={handlePublishRival}
            className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
          >
            Publicar Búsqueda de Rival
          </Button>
        </div>
      </div>
    );
  }

  if (searchType === 'players') {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
          <button onClick={() => setSearchType(null)} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h2>Completar mi Equipo</h2>
        </div>

        <div className="p-4 space-y-6">
          {/* Match Info */}
          <div className="bg-secondary border border-[#047857] rounded-xl p-4">
            <h3 className="mb-2">{matchName}</h3>
            <p className="text-sm text-muted-foreground">{fieldName}</p>
            <p className="text-sm text-muted-foreground">{date} • {time}</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Team Level Section */}
            <div className="border-2 border-[#047857] rounded-xl p-4 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-[#047857]" />
                <h3>Define el Nivel de tu Búsqueda</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Nivel de tu Equipo *</Label>
                  <RadioGroup value={teamLevel} onValueChange={(value: string) => setTeamLevel(value as TeamLevel)} className="mt-3 space-y-3">
                    <div className="flex items-start space-x-3 p-3 border-2 rounded-lg border-border hover:border-[#047857] transition-colors">
                      <RadioGroupItem value="principiante" id="level-beginner-p" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="level-beginner-p" className="cursor-pointer">
                          <span className="block mb-1">Principiante</span>
                          <span className="text-sm text-muted-foreground">Fútbol social, sin presión</span>
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border-2 rounded-lg border-border hover:border-[#047857] transition-colors">
                      <RadioGroupItem value="intermedio" id="level-intermediate-p" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="level-intermediate-p" className="cursor-pointer">
                          <span className="block mb-1">Intermedio</span>
                          <span className="text-sm text-muted-foreground">Juego organizado, competitivo</span>
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border-2 rounded-lg border-border hover:border-[#047857] transition-colors">
                      <RadioGroupItem value="avanzado" id="level-advanced-p" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="level-advanced-p" className="cursor-pointer">
                          <span className="block mb-1">Avanzado</span>
                          <span className="text-sm text-muted-foreground">Alta intensidad, ligas locales</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="team-name-p">Nombre del Equipo (Opcional)</Label>
                  <Input
                    id="team-name-p"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Ej: Los Buitres F.C."
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

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

          {/* Action Button */}
          <Button
            onClick={handlePublishPlayers}
            className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
          >
            Publicar Búsqueda de Integrantes
          </Button>
        </div>
      </div>
    );
  }

  // Main selection screen
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>Configurar Búsqueda</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Match Info */}
        <div className="bg-secondary border border-[#047857] rounded-xl p-4">
          <h3 className="mb-2">{matchName}</h3>
          <p className="text-sm text-muted-foreground">{fieldName}</p>
          <p className="text-sm text-muted-foreground">{date} • {time}</p>
        </div>

        <div>
          <h3 className="mb-4">¿Qué necesitas para tu partido?</h3>
          
          <div className="space-y-3">
            {/* Option 1: Buscar Rival */}
            <div
              onClick={() => setSearchType('rival')}
              className="border-2 border-border rounded-xl p-5 cursor-pointer hover:border-[#047857] hover:bg-secondary transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#047857] rounded-full flex items-center justify-center flex-shrink-0">
                  <Trophy size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="mb-1">Buscar un Equipo Rival</h4>
                  <p className="text-sm text-muted-foreground">
                    Encuentra otro equipo para enfrentarse en un partido amistoso
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Buscar Integrantes */}
            <div
              onClick={() => setSearchType('players')}
              className="border-2 border-border rounded-xl p-5 cursor-pointer hover:border-[#047857] hover:bg-secondary transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#047857] rounded-full flex items-center justify-center flex-shrink-0">
                  <Users size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="mb-1">Completar mi Equipo</h4>
                  <p className="text-sm text-muted-foreground">
                    Busca jugadores para completar los espacios faltantes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        open={showPhoneModal}
        onClose={() => {
          setShowPhoneModal(false);
          setPendingPublishType(null);
        }}
        onVerified={handlePhoneVerified}
      />
    </div>
  );
}
