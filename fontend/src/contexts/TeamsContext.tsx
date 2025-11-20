import { createContext, useContext, useState, ReactNode } from 'react';

export interface TeamMember {
  id: string;
  name: string;
  username: string;
  email: string;
  position?: string;
  jerseyNumber?: number;
  role: 'captain' | 'member';
  joinedAt: Date;
  status: 'online' | 'offline' | 'away';
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  captain: TeamMember;
  members: TeamMember[];
  createdAt: Date;
  chatId: string;
  stats?: {
    matchesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
  };
}

export interface TeamChat {
  id: string;
  teamId: string;
  teamName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isPermanent: true; // Team chats are always permanent
}

interface TeamsContextType {
  teams: Team[];
  teamChats: TeamChat[];
  userTeams: Team[]; // Teams where current user is member or captain
  createTeam: (teamData: Omit<Team, 'id' | 'createdAt' | 'chatId'>) => void;
  addMemberToTeam: (teamId: string, member: TeamMember) => void;
  removeMemberFromTeam: (teamId: string, memberId: string) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  deleteTeam: (teamId: string) => void;
  getTeamMembers: (teamId: string) => TeamMember[];
  isUserInTeam: (teamId: string) => boolean;
  getUserRole: (teamId: string) => 'captain' | 'member' | null;
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

// Mock current user
const currentUser: TeamMember = {
  id: 'current',
  name: 'Juan Pérez',
  username: '@juanperez',
  email: 'juan@example.com',
  role: 'captain',
  joinedAt: new Date(),
  status: 'online'
};

// Mock teams
const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Los Tigres FC',
    description: 'Equipo competitivo de fútbol 7',
    captain: currentUser,
    members: [
      currentUser,
      {
        id: '1',
        name: 'Carlos Mendoza',
        username: '@carlosm',
        email: 'carlos@example.com',
        position: 'Delantero',
        jerseyNumber: 9,
        role: 'member',
        joinedAt: new Date('2024-01-15'),
        status: 'online'
      },
      {
        id: '2',
        name: 'Luis García',
        username: '@luisg',
        email: 'luis@example.com',
        position: 'Mediocampista',
        jerseyNumber: 10,
        role: 'member',
        joinedAt: new Date('2024-01-20'),
        status: 'offline'
      },
      {
        id: '3',
        name: 'Miguel Torres',
        username: '@miguelt',
        email: 'miguel@example.com',
        position: 'Defensa',
        jerseyNumber: 4,
        role: 'member',
        joinedAt: new Date('2024-02-01'),
        status: 'online'
      }
    ],
    createdAt: new Date('2024-01-10'),
    chatId: 'team-chat-1',
    stats: {
      matchesPlayed: 12,
      wins: 8,
      losses: 2,
      draws: 2
    }
  }
];

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [teamChats, setTeamChats] = useState<TeamChat[]>([
    {
      id: 'team-chat-1',
      teamId: 'team-1',
      teamName: 'Los Tigres FC',
      lastMessage: 'Nos vemos mañana para el partido!',
      lastMessageTime: 'Hace 2h',
      unreadCount: 3,
      isPermanent: true
    }
  ]);

  // Get teams where current user is member or captain
  const userTeams = teams.filter(team => 
    team.captain.id === 'current' || team.members.some(m => m.id === 'current')
  );

  const createTeam = (teamData: Omit<Team, 'id' | 'createdAt' | 'chatId'>) => {
    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}`,
      createdAt: new Date(),
      chatId: `team-chat-${Date.now()}`
    };

    setTeams(prev => [newTeam, ...prev]);

    // Create permanent team chat
    const newChat: TeamChat = {
      id: newTeam.chatId,
      teamId: newTeam.id,
      teamName: newTeam.name,
      lastMessage: `Equipo ${newTeam.name} creado`,
      lastMessageTime: 'Ahora',
      unreadCount: 0,
      isPermanent: true
    };

    setTeamChats(prev => [newChat, ...prev]);
  };

  const addMemberToTeam = (teamId: string, member: TeamMember) => {
    setTeams(prev => prev.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          members: [...team.members, member]
        };
      }
      return team;
    }));
  };

  const removeMemberFromTeam = (teamId: string, memberId: string) => {
    setTeams(prev => prev.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          members: team.members.filter(m => m.id !== memberId)
        };
      }
      return team;
    }));
  };

  const updateTeam = (teamId: string, updates: Partial<Team>) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId ? { ...team, ...updates } : team
    ));
  };

  const deleteTeam = (teamId: string) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
    setTeamChats(prev => prev.filter(c => c.teamId !== teamId));
  };

  const getTeamMembers = (teamId: string): TeamMember[] => {
    const team = teams.find(t => t.id === teamId);
    return team?.members || [];
  };

  const isUserInTeam = (teamId: string): boolean => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return false;
    return team.captain.id === 'current' || team.members.some(m => m.id === 'current');
  };

  const getUserRole = (teamId: string): 'captain' | 'member' | null => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return null;
    if (team.captain.id === 'current') return 'captain';
    if (team.members.some(m => m.id === 'current')) return 'member';
    return null;
  };

  return (
    <TeamsContext.Provider
      value={{
        teams,
        teamChats,
        userTeams,
        createTeam,
        addMemberToTeam,
        removeMemberFromTeam,
        updateTeam,
        deleteTeam,
        getTeamMembers,
        isUserInTeam,
        getUserRole
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
}

export function useTeams() {
  const context = useContext(TeamsContext);
  if (!context) {
    throw new Error('useTeams must be used within TeamsProvider');
  }
  return context;
}
