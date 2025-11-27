import { useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Settings, Trophy, Calendar, MapPin, LogOut, Building2, ArrowLeftRight, ListOrdered, Users } from "lucide-react";
import { ProfileSettingsScreen } from "./ProfileSettingsScreen";
import { MyMatchesScreen } from "./MyMatchesScreen";
import { TeamsManagementScreen } from "./TeamsManagementScreen";
import { useUser } from "../../contexts/UserContext";

interface PlayerProfileProps {
  isOwner: boolean;
  currentMode: 'player' | 'manager';
  onRegisterAsOwner: () => void;
  onSwitchMode: () => void;
  onOpenChat?: (matchId: string) => void;
}

export function PlayerProfile({ isOwner, currentMode, onRegisterAsOwner, onSwitchMode, onOpenChat }: PlayerProfileProps) {
  const {user, logout} = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const [showMyMatches, setShowMyMatches] = useState(false);
  const [showTeams, setShowTeams] = useState(false);

  if (showSettings) {
    return <ProfileSettingsScreen onBack={() => setShowSettings(false)} />;
  }

  if (showMyMatches) {
    return (
      <MyMatchesScreen
        onBack={() => setShowMyMatches(false)}
        onOpenChat={(matchId) => {
          setShowMyMatches(false);
          onOpenChat?.(matchId);
        }}
      />
    );
  }

  if (showTeams) {
    return <TeamsManagementScreen onBack={() => setShowTeams(false)} />;
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">Mi Perfil</h1>
          <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-muted rounded-lg">
            <Settings size={24} />
          </button>
        </div>

        {isOwner && (
          <div className="bg-gradient-to-r from-[#047857] to-[#10b981] rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  {currentMode === 'player' ? (
                    <Building2 size={20} />
                  ) : (
                    <ArrowLeftRight size={20} />
                  )}
                </div>
                <div>
                  <p className="text-sm opacity-90">
                    {currentMode === 'player' ? 'Cambiar a' : 'Modo actual'}
                  </p>
                  <p className="font-medium">
                    {currentMode === 'player' ? 'Modo Administrador' : 'Administrador'}
                  </p>
                </div>
              </div>
              <Button
                onClick={onSwitchMode}
                size="sm"
                className="bg-white text-[#047857] hover:bg-white/90"
              >
                Cambiar
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarFallback className="bg-[#047857] text-white text-2xl">
              JD
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="text-xl mb-1">{user.name || 'Usuario'}</h2>
            <p className="text-muted-foreground">{user.email || 'Sin email'}</p>
          </div>

          <div className="flex gap-2">
            <Badge variant="secondary" className="px-3 py-1">{user.position || 'Jugador'}</Badge>
            <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none px-3 py-1">
              Activo
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-2xl text-[#047857] mb-1">24</p>
            <p className="text-sm text-muted-foreground">Partidos</p>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-2xl text-[#047857] mb-1">12</p>
            <p className="text-sm text-muted-foreground">Goles</p>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-2xl text-[#047857] mb-1">4.8</p>
            <p className="text-sm text-muted-foreground">Rating</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3>Información</h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <MapPin size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Ubicación</p>
                <p>Tahuaycani, Juliaca</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Calendar size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Miembro desde</p>
                <p>Enero 2024</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Trophy size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Ranking</p>
                <p>Top 15% en tu zona</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3>Próximos partidos</h3>
            <Button
              onClick={() => setShowMyMatches(true)}
              variant="ghost"
              size="sm"
              className="text-[#047857] hover:text-[#047857]/90"
            >
              Ver todos
            </Button>
          </div>
          
          <div className="border border-border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4>Cancha La Merced</h4>
              <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                Confirmado
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Hoy, 18:00 - 19:00</p>
          </div>

          <div className="border border-border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4>Estadio Zona Sur</h4>
              <Badge variant="secondary">Pendiente</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Sábado, 15:00 - 16:00</p>
          </div>

          {/* Quick Action Button to My Matches */}
          <Button
            onClick={() => setShowMyMatches(true)}
            variant="outline"
            className="w-full border-[#047857] text-[#047857] hover:bg-secondary"
          >
            <ListOrdered size={20} className="mr-2" />
            Gestionar Mis Partidos
          </Button>
        </div>

        <div className="pt-4 space-y-3">
          {!isOwner && (
            <div className="bg-secondary rounded-xl p-4 border-2 border-[#047857] border-dashed">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-[#047857] rounded-full flex items-center justify-center flex-shrink-0">
                  <Building2 size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="mb-1">¿Tienes canchas deportivas?</h4>
                  <p className="text-sm text-muted-foreground">
                    Regístrate como dueño y gestiona tus canchas en la plataforma
                  </p>
                </div>
              </div>
              <Button 
                onClick={onRegisterAsOwner}
                className="w-full bg-[#047857] hover:bg-[#047857]/90"
              >
                Registrarse como Dueño
              </Button>
            </div>
          )}

          <Button
            onClick={() => setShowTeams(true)}
            variant="outline"
            className="w-full h-12 border-[#047857] text-[#047857] hover:bg-secondary"
          >
            <Users size={20} className="mr-2" />
            Mis Equipos Formales
          </Button>
          
          <Button onClick={logout} variant="outline" className="w-full h-12 text-destructive border-destructive hover:bg-destructive hover:text-white">
            <LogOut size={20} className="mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
