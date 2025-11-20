import { useState } from "react";
import { ArrowLeft, MapPin, Clock, Users, Trophy, Calendar, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
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

interface TeamDetailScreenProps {
  type: 'team' | 'rival';
  onBack: () => void;
  onJoin: (chatName: string) => void;
}

export function TeamDetailScreen({ type, onBack, onJoin }: TeamDetailScreenProps) {
  const isTeam = type === 'team';
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleJoinClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmJoin = () => {
    setShowConfirmDialog(false);
    
    // Lógica de registro:
    // 1. Si es búsqueda de integrantes: Añadir al jugador al partido
    // 2. Si es búsqueda de rival: Marcar como "Rival Encontrado"
    // 3. Crear/unirse al chat del partido
    // 4. Enviar notificación al creador
    // 5. Redirigir al chat
    
    // Simular notificación
    const userName = 'Usuario Actual'; // En producción sería el nombre real del usuario
    const teamName = 'El Pecho Frio';
    
    if (isTeam) {
      // Notificación para búsqueda de integrantes
      console.log(`¡${userName} se ha unido a tu equipo!`);
    } else {
      // Notificación para búsqueda de rival
      console.log(`¡${teamName} ha aceptado tu reto!`);
    }
    
    // Crear chat automáticamente
    const chatName = isTeam 
      ? `${teamName} - Partido 7v7` 
      : `Reto vs ${teamName}`;
    
    onJoin(chatName);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>{isTeam ? 'Detalle de Convocatoria' : 'Detalle de Desafío'}</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Team/Player Info */}
        <div className="bg-secondary border border-[#047857] rounded-xl p-5">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-[#047857] text-white text-2xl">
                E
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="mb-1">El Pecho Frio</h3>
              <p className="text-sm text-muted-foreground mb-2">@pechofriofc</p>
              {isTeam && (
                <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                  <Users size={14} className="mr-1" />
                  Busca 2 jugadores
                </Badge>
              )}
              {!isTeam && (
                <Badge className="bg-[#047857] hover:bg-[#047857]/90 text-white border-none">
                  <Trophy size={14} className="mr-1" />
                  Buscando Rival
                </Badge>
              )}
            </div>
          </div>

          {/* Nivel de Juego */}
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-[#047857]" />
            <span className="text-sm">Nivel de Juego:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((star) => (
                <div
                  key={star}
                  className="w-6 h-6 rounded bg-[#047857] flex items-center justify-center text-white text-xs"
                >
                  ★
                </div>
              ))}
              <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                ★
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Equipo amateur con ganas de jugar y pasarla bien. Buscamos jugadores comprometidos para completar nuestro equipo.
          </p>
        </div>

        {/* Match Info */}
        <div>
          <h3 className="mb-3">Información del {isTeam ? 'Partido' : 'Reto'}</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <MapPin size={20} className="text-[#047857]" />
              <div>
                <p className="text-sm text-muted-foreground">Cancha</p>
                <p>Canchita La Merced, Tahuaycani</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Calendar size={20} className="text-[#047857]" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                <p>Hoy, 10 de Octubre - 6:30PM a 7:00PM</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Users size={20} className="text-[#047857]" />
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Cancha</p>
                <p>Fútbol 7v7</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Clock size={20} className="text-[#047857]" />
              <div>
                <p className="text-sm text-muted-foreground">Duración</p>
                <p>1 hora</p>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción del Reto */}
        {!isTeam && (
          <div>
            <h3 className="mb-3">Descripción del Reto</h3>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm">
                Buscamos un equipo de nivel intermedio para un partido amistoso. 
                Queremos competir de manera sana y disfrutar del fútbol. ¡Vamos con todo!
              </p>
            </div>
          </div>
        )}

        {/* Costo */}
        <div className="bg-secondary rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Costo por jugador:</span>
            <span className="text-xl text-[#047857]">S/ 5.00</span>
          </div>
          <p className="text-xs text-muted-foreground">
            El costo total de la cancha se divide entre todos los jugadores
          </p>
        </div>
      </div>

      {/* Footer con botón de acción */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 pb-6">
        <Button
          onClick={handleJoinClick}
          className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
        >
          {isTeam ? 'Unirme al Partido' : 'Aceptar Reto'}
        </Button>
      </div>

      {/* Dialog de Confirmación */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isTeam ? '¿Unirte al Partido?' : '¿Aceptar Reto?'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <div>
                  {isTeam 
                    ? '¿Deseas unirte a este partido y notificar al equipo organizador?'
                    : '¿Deseas aceptar este reto y notificar al equipo retador?'
                  }
                </div>
                <div className="text-[#047857]">
                  Se creará automáticamente un chat grupal para que puedan coordinar todos los detalles.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmJoin}
              className="bg-[#047857] hover:bg-[#047857]/90"
            >
              {isTeam ? 'Sí, Unirme' : 'Sí, Aceptar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
