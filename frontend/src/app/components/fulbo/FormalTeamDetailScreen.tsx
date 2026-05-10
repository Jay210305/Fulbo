import { useState } from "react";
import { ArrowLeft, Users, MessageCircle, Trophy, Plus, X, Crown, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Team, TeamMember, useTeams } from "../../contexts/TeamsContext";
import { useMatches, Friend } from "../../contexts/MatchesContext";
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

interface FormalTeamDetailScreenProps {
  team: Team;
  onBack: () => void;
}

export function FormalTeamDetailScreen({ team, onBack }: FormalTeamDetailScreenProps) {
  const { addMemberToTeam, removeMemberFromTeam } = useTeams();
  const { friends } = useMatches();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showRemoveMember, setShowRemoveMember] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isCaptain = team.captain.id === 'current';

  // Filter friends who are not team members
  const availableFriends = friends.filter(
    friend => !team.members.some(m => m.id === friend.id)
  ).filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = (friend: Friend) => {
    const newMember: TeamMember = {
      ...friend,
      role: 'member',
      joinedAt: new Date()
    };

    addMemberToTeam(team.id, newMember);
    setShowAddMember(false);
    setSearchQuery('');
    alert(`${friend.name} ha sido agregado al equipo. Se le ha enviado una notificación.`);
  };

  const handleRemoveMember = () => {
    if (selectedMemberId) {
      removeMemberFromTeam(team.id, selectedMemberId);
      setShowRemoveMember(false);
      setSelectedMemberId(null);
      alert('Miembro removido del equipo');
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2>{team.name}</h2>
          <p className="text-sm text-muted-foreground">
            {isCaptain ? 'Capitán' : 'Miembro'} • {team.members.length} miembros
          </p>
        </div>
        {isCaptain && (
          <button className="p-2 hover:bg-muted rounded-full text-[#047857]">
            <Settings size={20} />
          </button>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Team Header */}
        <div className="bg-gradient-to-r from-[#047857] to-[#10b981] rounded-xl p-6 text-white text-center">
          <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-white">
            <AvatarFallback className="bg-white text-[#047857] text-3xl">
              {team.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-white mb-2">{team.name}</h3>
          {team.description && (
            <p className="text-sm text-white/90">{team.description}</p>
          )}
        </div>

        {/* Stats */}
        {team.stats && (
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-2xl text-[#047857] mb-1">{team.stats.matchesPlayed}</p>
              <p className="text-xs text-muted-foreground">Partidos</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-2xl text-[#34d399] mb-1">{team.stats.wins}</p>
              <p className="text-xs text-muted-foreground">Victorias</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-2xl text-muted-foreground mb-1">{team.stats.draws}</p>
              <p className="text-xs text-muted-foreground">Empates</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-2xl text-destructive mb-1">{team.stats.losses}</p>
              <p className="text-xs text-muted-foreground">Derrotas</p>
            </div>
          </div>
        )}

        {/* Members Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2">
              <Users size={20} className="text-[#047857]" />
              Miembros ({team.members.length})
            </h3>
            {isCaptain && (
              <button
                onClick={() => setShowAddMember(true)}
                className="p-2 hover:bg-muted rounded-full text-[#047857]"
              >
                <Plus size={20} />
              </button>
            )}
          </div>

          <div className="space-y-2">
            {team.members.map((member) => (
              <div
                key={member.id}
                className="bg-secondary border border-border rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className={member.role === 'captain' ? "bg-orange-600 text-white" : "bg-muted"}>
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm flex items-center gap-2">
                      {member.name}
                      {member.role === 'captain' && (
                        <Badge className="bg-orange-600 text-white hover:bg-orange-600/90 text-xs">
                          <Crown size={12} className="mr-1" />
                          Capitán
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.username}
                      {member.position && ` • ${member.position}`}
                      {member.jerseyNumber && ` • #${member.jerseyNumber}`}
                    </p>
                  </div>
                </div>
                
                {isCaptain && member.role !== 'captain' && (
                  <button
                    onClick={() => {
                      setSelectedMemberId(member.id);
                      setShowRemoveMember(true);
                    }}
                    className="p-2 hover:bg-muted rounded-full text-destructive"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button
            className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
            onClick={() => alert('Abriendo chat del equipo...')}
          >
            <MessageCircle size={20} className="mr-2" />
            Abrir Chat del Equipo
          </Button>

          {isCaptain && (
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => alert('Próximamente: Gestión avanzada del equipo')}
            >
              <Trophy size={20} className="mr-2" />
              Ver Historial de Partidos
            </Button>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Chat Permanente:</strong> Tu equipo tiene un chat exclusivo para coordinar.
            Todos los miembros pueden participar sin importar si están en el próximo partido.
          </p>
        </div>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Miembro al Equipo</DialogTitle>
            <DialogDescription>
              Selecciona amigos para invitar a "{team.name}"
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar amigos..."
            className="mb-2"
          />

          {/* Friends List */}
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {availableFriends.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchQuery ? 'No se encontraron amigos' : 'Todos tus amigos ya están en el equipo'}
              </p>
            ) : (
              availableFriends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => handleAddMember(friend)}
                  className="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-muted">
                      {friend.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left flex-1">
                    <p className="text-sm">{friend.name}</p>
                    <p className="text-xs text-muted-foreground">{friend.username}</p>
                  </div>
                  <Plus size={18} className="text-[#047857]" />
                </button>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMember(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <AlertDialog open={showRemoveMember} onOpenChange={setShowRemoveMember}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Miembro</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas remover este miembro del equipo? 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedMemberId(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
