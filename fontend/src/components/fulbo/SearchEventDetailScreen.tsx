import { useState } from "react";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Trophy, TrendingUp, MessageSquare } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { SearchEvent } from "../../types/field";

interface SearchEventDetailScreenProps {
  event: SearchEvent;
  onBack: () => void;
  onJoin: (event: SearchEvent) => void;
}

export function SearchEventDetailScreen({ event, onBack, onJoin }: SearchEventDetailScreenProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const getLevelLabel = (level: string) => {
    const labels = {
      principiante: 'Principiante',
      intermedio: 'Intermedio',
      avanzado: 'Avanzado'
    };
    return labels[level as keyof typeof labels] || level;
  };

  const getLevelDescription = (level: string) => {
    const descriptions = {
      principiante: 'Fútbol social, sin presión',
      intermedio: 'Juego organizado, competitivo',
      avanzado: 'Juego de alta intensidad, ligas locales'
    };
    return descriptions[level as keyof typeof descriptions] || '';
  };

  const handleJoinClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmJoin = () => {
    onJoin(event);
    setShowConfirmDialog(false);
  };

  const isPlayersSearch = event.type === 'players';
  const ctaText = isPlayersSearch ? 'Unirme al Equipo' : 'Aceptar el Reto';
  const confirmText = isPlayersSearch 
    ? '¿Estás seguro que deseas unirte al equipo?' 
    : '¿Estás seguro que deseas aceptar el reto?';

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>Detalle de Convocatoria</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl mb-2">{event.matchName}</h1>
          <Badge className={`${
            isPlayersSearch 
              ? 'bg-[#047857] hover:bg-[#047857]/90' 
              : 'bg-purple-600 hover:bg-purple-600/90'
          } text-white border-none`}>
            {isPlayersSearch ? (
              <>
                <Users size={14} className="mr-1" />
                Busca Integrantes
              </>
            ) : (
              <>
                <Trophy size={14} className="mr-1" />
                Busca Rival
              </>
            )}
          </Badge>
        </div>

        {/* Main Info Card */}
        <div className="border-2 border-[#047857] rounded-xl p-5 space-y-4 bg-secondary">
          <h3>Información del Partido</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar size={20} className="text-[#047857] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p>{event.date}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={20} className="text-[#047857] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Hora y Duración</p>
                <p>{event.time} • {event.duration}h</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-[#047857] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Ubicación</p>
                <p>{event.fieldName}</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Trophy size={20} className="text-[#047857] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Cancha</p>
                <p>{event.fieldType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Level */}
        <div className="border-2 border-[#047857] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-[#047857]" />
            <h3>Nivel del Equipo</h3>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{getLevelLabel(event.teamLevel)}</span>
              <Badge variant="outline" className="border-[#047857] text-[#047857]">
                {event.teamLevel.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{getLevelDescription(event.teamLevel)}</p>
          </div>

          {event.creatorTeamName && (
            <div className="bg-white rounded-lg p-3 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Nombre del Equipo</p>
              <p>{event.creatorTeamName}</p>
            </div>
          )}
        </div>

        {/* Requirements */}
        <div className="border-2 border-[#047857] rounded-xl p-5 space-y-3">
          <h3>Requerimientos</h3>
          
          {isPlayersSearch ? (
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Jugadores Faltantes</p>
                    <p className="text-2xl text-[#047857]">{event.playersNeeded || 0}</p>
                  </div>
                  <Users size={32} className="text-muted-foreground" />
                </div>
              </div>

              {event.positionNeeded && event.positionNeeded !== 'cualquier' && (
                <div className="bg-white rounded-lg p-3 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Posición Requerida</p>
                  <Badge className="bg-[#047857] text-white hover:bg-[#047857]/90">
                    {event.positionNeeded}
                  </Badge>
                </div>
              )}

              {event.currentPlayers && event.maxPlayers && (
                <div className="bg-white rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Confirmados</span>
                    <span className="text-sm">{event.currentPlayers}/{event.maxPlayers}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-[#047857] h-2 rounded-full transition-all"
                      style={{ width: `${(event.currentPlayers / event.maxPlayers) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Nivel de Rival Buscado</p>
              <div className="flex items-center gap-2">
                <Badge className="bg-[#047857] text-white hover:bg-[#047857]/90">
                  {getLevelLabel(event.teamLevel)}
                </Badge>
                <span className="text-sm text-muted-foreground">o superior</span>
              </div>
            </div>
          )}
        </div>

        {/* Creator Message */}
        <div className="border-2 border-[#047857] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-[#047857]" />
            <h3>Mensaje del Organizador</h3>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-2">De: {event.creatorName}</p>
            <p className="whitespace-pre-wrap">{event.message}</p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleJoinClick}
          className="w-full h-14 bg-[#047857] hover:bg-[#047857]/90 text-lg"
        >
          {ctaText}
        </Button>

        {/* Info Note */}
        <div className="bg-secondary rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground text-center">
            {isPlayersSearch 
              ? 'Al unirte, el partido se agregará a tus próximos partidos y serás añadido al chat del equipo.'
              : 'Al aceptar el reto, tu equipo será notificado y podrás coordinar los detalles en el chat.'}
          </p>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Participación</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmText}
              {' '}Confirmarás tu participación en el partido del {event.date} a las {event.time}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmJoin}
              className="bg-[#047857] hover:bg-[#047857]/90"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
