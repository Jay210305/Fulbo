import { useState } from "react";
import { ArrowLeft, Users, UserPlus, Trophy, Search, X, Check, Shield, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
import { useMatches, Friend } from "../../contexts/MatchesContext";
import { useTeams, TeamMember } from "../../contexts/TeamsContext";

interface TeamLineupScreenProps {
  matchName: string;
  matchType: string; // '5v5', '7v7', '11v11'
  matchId: string;
  onBack: () => void;
  onCreateSearchEvent?: () => void;
}

interface AssignedPlayer {
  id: string;
  name: string;
  username: string;
  source: 'team' | 'friend' | 'current';
  confirmed: boolean;
  teamName?: string; // If from formal team
}

type PlayerSource = 'all' | 'team' | 'friends';

export function TeamLineupScreen({ 
  matchName, 
  matchType,
  matchId,
  onBack,
  onCreateSearchEvent
}: TeamLineupScreenProps) {
  const { friends } = useMatches();
  const { userTeams, getTeamMembers } = useTeams();
  const teamSize = parseInt(matchType.split('v')[0]) * 2; // Total players needed
  
  // Current user (creator) is always in the team
  const currentUser: AssignedPlayer = {
    id: 'current',
    name: 'Juan Pérez',
    username: '@juanperez',
    source: 'current',
    confirmed: true
  };

  // State for teams
  const [localTeam, setLocalTeam] = useState<AssignedPlayer[]>([currentUser]);
  const [rivalTeam, setRivalTeam] = useState<AssignedPlayer[]>([]);
  const [rivalAssignedTeamName, setRivalAssignedTeamName] = useState<string | null>(null);
  const [isSearchingRival, setIsSearchingRival] = useState(false);

  // Panel state
  const [showPlayerPanel, setShowPlayerPanel] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<'local' | 'rival'>('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSource, setActiveSource] = useState<PlayerSource>('all');

  // Modal states
  const [showAssignRivalModal, setShowAssignRivalModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Known rival teams (mock)
  const knownRivals = [
    { id: '1', name: 'Los Cracks FC' },
    { id: '2', name: 'Tigres United' },
    { id: '3', name: 'Águilas FC' }
  ];

  // Get all available players from both sources
  const getAvailablePlayers = (): { player: AssignedPlayer; source: 'team' | 'friend' }[] => {
    const assigned = [...localTeam, ...rivalTeam].map(p => p.id);
    const players: { player: AssignedPlayer; source: 'team' | 'friend' }[] = [];

    // Add team members
    if (activeSource === 'all' || activeSource === 'team') {
      userTeams.forEach(team => {
        team.members
          .filter(m => !assigned.includes(m.id))
          .forEach(member => {
            players.push({
              player: {
                id: member.id,
                name: member.name,
                username: member.username,
                source: 'team',
                confirmed: false,
                teamName: team.name
              },
              source: 'team'
            });
          });
      });
    }

    // Add individual friends
    if (activeSource === 'all' || activeSource === 'friends') {
      friends
        .filter(f => !assigned.includes(f.id))
        .forEach(friend => {
          players.push({
            player: {
              id: friend.id,
              name: friend.name,
              username: friend.username,
              source: 'friend',
              confirmed: false
            },
            source: 'friend'
          });
        });
    }

    // Filter by search
    return players.filter(({ player }) =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const availablePlayers = getAvailablePlayers();

  // Team members grouped
  const teamPlayers = availablePlayers.filter(p => p.source === 'team');
  const friendPlayers = availablePlayers.filter(p => p.source === 'friend');

  const handleAddPlayer = (player: AssignedPlayer) => {
    if (selectedTarget === 'local') {
      setLocalTeam(prev => [...prev, player]);
    } else {
      setRivalTeam(prev => [...prev, player]);
    }
    setShowPlayerPanel(false);
    setSearchQuery('');
    setActiveSource('all');
  };

  const handleRemovePlayer = (playerId: string, team: 'local' | 'rival') => {
    if (playerId === 'current') return; // Can't remove current user
    
    if (team === 'local') {
      setLocalTeam(prev => prev.filter(p => p.id !== playerId));
    } else {
      setRivalTeam(prev => prev.filter(p => p.id !== playerId));
    }
  };

  const handleOpenPanel = (target: 'local' | 'rival') => {
    setSelectedTarget(target);
    setShowPlayerPanel(true);
  };

  const handleAssignKnownRival = (rivalId: string) => {
    const rival = knownRivals.find(r => r.id === rivalId);
    if (rival) {
      setRivalAssignedTeamName(rival.name);
      setIsSearchingRival(false);
      setShowAssignRivalModal(false);
      alert(`Rival "${rival.name}" asignado. Se ha notificado al líder.`);
    }
  };

  const handleSearchPublicRival = () => {
    setIsSearchingRival(true);
    setShowAssignRivalModal(false);
    if (onCreateSearchEvent) {
      onCreateSearchEvent();
    }
  };

  const handleSaveLineup = () => {
    setShowConfirmDialog(true);
  };

  const confirmSaveLineup = () => {
    const newInvites = localTeam.filter(p => !p.confirmed && p.id !== 'current');
    if (newInvites.length > 0) {
      alert(`Invitaciones enviadas a ${newInvites.length} jugadores.`);
    }
    setShowConfirmDialog(false);
    onBack();
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2>Alineación y Asignación</h2>
          <p className="text-sm text-muted-foreground">{matchName} ({matchType})</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Match Info */}
        <div className="bg-gradient-to-r from-[#047857] to-[#10b981] rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80 mb-1">Partido</p>
              <h3 className="text-white text-xl">{matchName}</h3>
            </div>
            <Badge className="bg-white text-[#047857] hover:bg-white/90">
              {matchType}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local">Equipo Local</TabsTrigger>
            <TabsTrigger value="rival">
              {rivalAssignedTeamName ? 'Equipo Rival' : 'Equipo Visitante'}
            </TabsTrigger>
          </TabsList>

          {/* LOCAL TEAM TAB */}
          <TabsContent value="local" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2">
                <Shield size={20} className="text-[#047857]" />
                Equipo Local
              </h3>
              <Badge variant="outline">
                {localTeam.length}/{teamSize}
              </Badge>
            </div>

            {/* Players List */}
            <div className="bg-[#dcfce7] rounded-xl p-4 space-y-3">
              {localTeam.map((player) => (
                <div
                  key={player.id}
                  className="bg-white border-2 border-border rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className={player.source === 'current' ? "bg-[#047857] text-white" : player.source === 'team' ? "bg-orange-600 text-white" : "bg-muted"}>
                        {player.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm flex items-center gap-2">
                        {player.name}
                        {player.source === 'current' && (
                          <Badge className="bg-[#047857] text-white hover:bg-[#047857]/90 text-xs">
                            Tú
                          </Badge>
                        )}
                        {player.source === 'team' && player.teamName && (
                          <Badge variant="outline" className="text-xs">
                            {player.teamName}
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{player.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={player.confirmed ? "default" : "outline"} className={player.confirmed ? "bg-[#34d399] hover:bg-[#34d399]/90 text-white text-xs" : "text-xs"}>
                      {player.confirmed ? (
                        <>
                          <Check size={12} className="mr-1" />
                          Confirmado
                        </>
                      ) : (
                        'Pendiente'
                      )}
                    </Badge>
                    {player.source !== 'current' && (
                      <button
                        onClick={() => handleRemovePlayer(player.id, 'local')}
                        className="p-1 hover:bg-muted rounded-full"
                      >
                        <X size={16} className="text-destructive" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {localTeam.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay jugadores asignados
                </p>
              )}
            </div>

            <Button
              onClick={() => handleOpenPanel('local')}
              className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
            >
              <UserPlus size={20} className="mr-2" />
              Agregar Jugadores
            </Button>

            <Button
              onClick={handleSaveLineup}
              variant="outline"
              className="w-full h-12"
            >
              Guardar Alineación
            </Button>
          </TabsContent>

          {/* RIVAL TEAM TAB */}
          <TabsContent value="rival" className="space-y-4 mt-4">
            {/* If rival assigned */}
            {rivalAssignedTeamName ? (
              <div className="space-y-4">
                <div className="bg-[#fef3c7] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-orange-600 text-white text-lg">
                        {rivalAssignedTeamName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p>{rivalAssignedTeamName}</p>
                      <p className="text-sm text-muted-foreground">Equipo Rival</p>
                    </div>
                    <Badge className="bg-orange-600 text-white hover:bg-orange-600/90">
                      Asignado
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setRivalAssignedTeamName(null);
                    setRivalTeam([]);
                  }}
                >
                  Cambiar Rival
                </Button>
              </div>
            ) : isSearchingRival ? (
              /* If searching rival */
              <div className="bg-secondary rounded-xl p-6 text-center">
                <Search size={48} className="mx-auto mb-3 text-[#047857]" />
                <p className="mb-2">Buscando rival en la comunidad...</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Serás notificado cuando un equipo acepte el reto
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSearchingRival(false)}
                >
                  Cancelar Búsqueda
                </Button>
              </div>
            ) : (
              /* No rival assigned - show options */
              <div className="space-y-4">
                <h3 className="flex items-center gap-2">
                  <Trophy size={20} className="text-orange-600" />
                  Equipo Visitante
                </h3>

                {/* Players List */}
                <div className="bg-[#fef3c7] rounded-xl p-4 space-y-3">
                  {rivalTeam.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aún no has asignado jugadores al equipo visitante
                    </p>
                  ) : (
                    rivalTeam.map((player) => (
                      <div
                        key={player.id}
                        className="bg-white border-2 border-border rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className={player.source === 'team' ? "bg-orange-600 text-white" : "bg-muted"}>
                              {player.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm flex items-center gap-2">
                              {player.name}
                              {player.source === 'team' && player.teamName && (
                                <Badge variant="outline" className="text-xs">
                                  {player.teamName}
                                </Badge>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{player.username}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemovePlayer(player.id, 'rival')}
                          className="p-1 hover:bg-muted rounded-full"
                        >
                          <X size={16} className="text-destructive" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <Button
                  onClick={() => handleOpenPanel('rival')}
                  variant="outline"
                  className="w-full h-12 border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  <UserPlus size={20} className="mr-2" />
                  Agregar Jugadores al Equipo Visitante
                </Button>

                <Button
                  onClick={() => setShowAssignRivalModal(true)}
                  className="w-full h-12 bg-orange-600 hover:bg-orange-600/90 text-white"
                >
                  <Trophy size={20} className="mr-2" />
                  Asignar Equipo Rival
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Info */}
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Asigna jugadores desde tus equipos formales o amigos individuales. 
            Los miembros de equipos formales ya están en el chat permanente del equipo.
          </p>
        </div>
      </div>

      {/* PLAYER PANEL (Sheet) */}
      <Sheet open={showPlayerPanel} onOpenChange={setShowPlayerPanel}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>
              Agregar Jugadores al {selectedTarget === 'local' ? 'Equipo Local' : 'Equipo Visitante'}
            </SheetTitle>
            <SheetDescription>
              Selecciona jugadores de tus equipos formales o amigos individuales
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar jugadores..."
                className="pl-10"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <Button
                variant={activeSource === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSource('all')}
                className={activeSource === 'all' ? 'bg-[#047857] hover:bg-[#047857]/90' : ''}
              >
                Todos
              </Button>
              {userTeams.length > 0 && (
                <Button
                  variant={activeSource === 'team' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveSource('team')}
                  className={activeSource === 'team' ? 'bg-[#047857] hover:bg-[#047857]/90' : ''}
                >
                  Mis Equipos
                </Button>
              )}
              <Button
                variant={activeSource === 'friends' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSource('friends')}
                className={activeSource === 'friends' ? 'bg-[#047857] hover:bg-[#047857]/90' : ''}
              >
                Amigos
              </Button>
            </div>

            {/* Players List */}
            <div className="space-y-4 max-h-[calc(80vh-250px)] overflow-y-auto">
              {/* BLOQUE 1: Miembros de Equipos Formales */}
              {(activeSource === 'all' || activeSource === 'team') && teamPlayers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={18} className="text-orange-600" />
                    <h4 className="text-sm">Miembros de Equipos Formales</h4>
                  </div>
                  <div className="space-y-2">
                    {teamPlayers.map(({ player }) => (
                      <button
                        key={player.id}
                        onClick={() => handleAddPlayer(player)}
                        className="w-full flex items-center gap-3 p-3 border-2 border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-orange-600 text-white">
                            {player.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left flex-1">
                          <p className="text-sm flex items-center gap-2">
                            {player.name}
                            <Badge variant="outline" className="text-xs">
                              {player.teamName}
                            </Badge>
                          </p>
                          <p className="text-xs text-muted-foreground">{player.username}</p>
                        </div>
                        <ChevronRight size={18} className="text-orange-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* BLOQUE 2: Amigos Individuales */}
              {(activeSource === 'all' || activeSource === 'friends') && friendPlayers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={18} className="text-[#047857]" />
                    <h4 className="text-sm">Amigos Individuales</h4>
                  </div>
                  <div className="space-y-2">
                    {friendPlayers.map(({ player }) => (
                      <button
                        key={player.id}
                        onClick={() => handleAddPlayer(player)}
                        className="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-muted">
                            {player.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left flex-1">
                          <p className="text-sm">{player.name}</p>
                          <p className="text-xs text-muted-foreground">{player.username}</p>
                        </div>
                        <ChevronRight size={18} className="text-[#047857]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {availablePlayers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {searchQuery ? 'No se encontraron jugadores' : 'No hay jugadores disponibles'}
                </p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ASSIGN RIVAL MODAL */}
      <Dialog open={showAssignRivalModal} onOpenChange={setShowAssignRivalModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>¿Cómo quieres definir al Rival?</DialogTitle>
            <DialogDescription>
              Elige una opción para asignar el equipo rival
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="border-2 border-border rounded-xl p-4 space-y-3">
              <h4 className="flex items-center gap-2">
                <Trophy size={18} className="text-[#047857]" />
                Equipo Rival Conocido
              </h4>
              <p className="text-sm text-muted-foreground">
                Selecciona un equipo que ya has enfrentado
              </p>
              <Select onValueChange={handleAssignKnownRival}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar equipo..." />
                </SelectTrigger>
                <SelectContent>
                  {knownRivals.map((rival) => (
                    <SelectItem key={rival.id} value={rival.id}>
                      {rival.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-2 border-[#047857] rounded-xl p-4 space-y-3">
              <h4 className="flex items-center gap-2">
                <Search size={18} className="text-[#047857]" />
                Buscar en la Comunidad
              </h4>
              <p className="text-sm text-muted-foreground">
                Publica tu búsqueda y espera a que un equipo acepte
              </p>
              <Button
                onClick={handleSearchPublicRival}
                className="w-full bg-[#047857] hover:bg-[#047857]/90"
              >
                <Search size={18} className="mr-2" />
                Crear Petición Pública
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignRivalModal(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION DIALOG */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Guardar Alineación</AlertDialogTitle>
            <AlertDialogDescription>
              Se enviará una notificación a todos los jugadores invitados al partido "{matchName}".
              <br /><br />
              ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSaveLineup}
              className="bg-[#047857] hover:bg-[#047857]/90"
            >
              Enviar Invitaciones
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
