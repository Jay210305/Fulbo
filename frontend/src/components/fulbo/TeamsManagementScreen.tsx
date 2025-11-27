import { useState } from "react";
import { ArrowLeft, Plus, Users, Trophy, MessageCircle, Settings, Crown } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { useTeams, Team } from "../../contexts/TeamsContext";
import { CreateTeamScreen } from "./CreateTeamScreen";
import { FormalTeamDetailScreen } from "./FormalTeamDetailScreen";

interface TeamsManagementScreenProps {
  onBack: () => void;
}

export function TeamsManagementScreen({ onBack }: TeamsManagementScreenProps) {
  const { userTeams } = useTeams();
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  if (showCreateTeam) {
    return (
      <CreateTeamScreen
        onBack={() => setShowCreateTeam(false)}
        onTeamCreated={() => setShowCreateTeam(false)}
      />
    );
  }

  if (selectedTeam) {
    return (
      <FormalTeamDetailScreen
        team={selectedTeam}
        onBack={() => setSelectedTeam(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2>Mis Equipos</h2>
          <p className="text-sm text-muted-foreground">Gestiona tus equipos formales</p>
        </div>
        <button
          onClick={() => setShowCreateTeam(true)}
          className="p-2 hover:bg-muted rounded-full text-[#047857]"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Create Team CTA */}
        {userTeams.length === 0 && (
          <Card className="p-6 text-center bg-gradient-to-r from-[#047857] to-[#10b981] text-white">
            <Trophy size={48} className="mx-auto mb-4 text-white" />
            <h3 className="text-white mb-2">Crea tu Primer Equipo</h3>
            <p className="text-sm text-white/90 mb-4">
              Organiza un equipo formal con tus amigos y compite juntos
            </p>
            <Button
              onClick={() => setShowCreateTeam(true)}
              className="bg-white text-[#047857] hover:bg-white/90"
            >
              <Plus size={18} className="mr-2" />
              Crear Equipo
            </Button>
          </Card>
        )}

        {/* Teams List */}
        {userTeams.map((team) => {
          const isCaptain = team.captain.id === 'current';
          const wins = team.stats?.wins || 0;
          const losses = team.stats?.losses || 0;
          const winRate = team.stats?.matchesPlayed 
            ? Math.round((wins / team.stats.matchesPlayed) * 100)
            : 0;

          return (
            <Card
              key={team.id}
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedTeam(team)}
            >
              <div className="flex items-start gap-4">
                {/* Team Avatar */}
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-[#047857] text-white text-xl">
                    {team.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Team Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="flex items-center gap-2">
                        {team.name}
                        {isCaptain && (
                          <Badge className="bg-orange-600 text-white hover:bg-orange-600/90 text-xs">
                            <Crown size={12} className="mr-1" />
                            Capitán
                          </Badge>
                        )}
                      </h3>
                      {team.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {team.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Members */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users size={16} />
                      <span>{team.members.length} miembros</span>
                    </div>
                    {team.stats && (
                      <Badge variant="outline" className="text-xs">
                        {winRate}% Victorias
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  {team.stats && (
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#34d399]"></div>
                        <span className="text-muted-foreground">{team.stats.wins}G</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-muted"></div>
                        <span className="text-muted-foreground">{team.stats.draws}E</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-destructive"></div>
                        <span className="text-muted-foreground">{team.stats.losses}P</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    // Open team chat
                    alert(`Abriendo chat del equipo ${team.name}`);
                  }}
                >
                  <MessageCircle size={16} className="mr-2" />
                  Chat
                </Button>
                {isCaptain && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setSelectedTeam(team);
                    }}
                  >
                    <Settings size={16} className="mr-2" />
                    Gestionar
                  </Button>
                )}
              </div>
            </Card>
          );
        })}

        {/* Add Another Team Button */}
        {userTeams.length > 0 && (
          <Button
            onClick={() => setShowCreateTeam(true)}
            variant="outline"
            className="w-full h-12 border-dashed border-2 border-[#047857] text-[#047857] hover:bg-secondary"
          >
            <Plus size={20} className="mr-2" />
            Crear Nuevo Equipo
          </Button>
        )}

        {/* Info Card */}
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Equipos Formales:</strong> Crea equipos permanentes con tus amigos. 
            Los equipos tienen chat propio y puedes asignarlos rápidamente a tus partidos.
          </p>
        </div>
      </div>
    </div>
  );
}
