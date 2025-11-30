import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import { SectionHeader } from "../components/SectionHeader";
import { Team, TeamInvite } from "../types";

interface TeamsViewProps {
  onBack: () => void;
}

// Mock data - would come from API in real app
const MOCK_TEAMS: Team[] = [
  { name: 'Los Tigres FC', role: 'Capitán', members: 12 },
  { name: 'Amigos del Barrio', role: 'Miembro', members: 8 }
];

const MOCK_INVITES: TeamInvite[] = [
  { name: 'Relámpagos FC', invitedBy: 'Carlos' }
];

export function TeamsView({ onBack }: TeamsViewProps) {
  return (
    <div className="min-h-screen bg-white pb-20">
      <SectionHeader title="Mis Equipos" onBack={onBack} />

      <div className="p-4 space-y-4">
        <Button className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90">
          + Crear Nuevo Equipo
        </Button>

        {/* Active Teams */}
        <div className="space-y-3">
          <h3>Equipos donde participo ({MOCK_TEAMS.length})</h3>
          
          {MOCK_TEAMS.map((team, index) => (
            <TeamCard key={index} team={team} />
          ))}
        </div>

        {/* Pending Invites */}
        {MOCK_INVITES.length > 0 && (
          <div className="space-y-3">
            <h3>Solicitudes Pendientes ({MOCK_INVITES.length})</h3>
            {MOCK_INVITES.map((invite, index) => (
              <TeamInviteCard key={index} invite={invite} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TeamCard({ team }: { team: Team }) {
  return (
    <div className="border border-border rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-[#047857] text-white">
            {team.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4>{team.name}</h4>
          <p className="text-sm text-muted-foreground">{team.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users size={14} />
        <span>{team.members} miembros</span>
      </div>
    </div>
  );
}

function TeamInviteCard({ invite }: { invite: TeamInvite }) {
  return (
    <div className="border border-amber-500 bg-amber-50 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-amber-500 text-white">
            {invite.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4>{invite.name}</h4>
          <p className="text-sm text-muted-foreground">Te invitó a unirte</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button className="flex-1 bg-[#047857] hover:bg-[#047857]/90">
          Aceptar
        </Button>
        <Button variant="outline" className="flex-1">
          Rechazar
        </Button>
      </div>
    </div>
  );
}
