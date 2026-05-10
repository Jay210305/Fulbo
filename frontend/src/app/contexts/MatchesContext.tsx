import { createContext, useContext, useState, ReactNode } from 'react';

export interface Friend {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}

export interface FriendRequest {
  id: string;
  from: Friend;
  to: Friend;
  status: 'pending' | 'accepted' | 'rejected';
  sentAt: Date;
}

export interface Match {
  id: string;
  name: string;
  fieldName: string;
  location: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: 'upcoming' | 'completed' | 'played';
  players?: number;
  maxPlayers?: number;
  hasRival?: boolean;
  rivalTeamName?: string;
  rivalLeaderId?: string;
  searchingForRival?: boolean;
  internalMatch?: boolean; // True if it's just friends dividing into teams
  chatId: string;
  isPending?: boolean; // True if using "Pagar Después"
  expiresAt?: Date; // Only for pending reservations
}

export interface MatchChat {
  id: string;
  matchId: string;
  matchName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isPermanent: boolean; // True for completed/played matches, false for pending
  expiresAt?: Date; // Only for pending reservations
}

export interface MatchInvitation {
  id: string;
  matchId: string;
  matchName: string;
  from: Friend;
  status: 'pending' | 'accepted' | 'rejected';
  sentAt: Date;
}

interface MatchesContextType {
  matches: Match[];
  chats: MatchChat[];
  friends: Friend[];
  friendRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  matchInvitations: MatchInvitation[];
  addMatch: (match: Match) => void;
  addChat: (chat: MatchChat) => void;
  searchUsers: (query: string) => Friend[];
  sendFriendRequest: (friendId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  removeFriend: (friendId: string) => void;
  inviteFriendsToMatch: (matchId: string, friendIds: string[]) => void;
  acceptMatchInvitation: (invitationId: string) => void;
  rejectMatchInvitation: (invitationId: string) => void;
}

const MatchesContext = createContext<MatchesContextType | undefined>(undefined);

// Mock data
const mockFriends: Friend[] = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    username: '@carlosm',
    email: 'carlos@example.com',
    status: 'online'
  },
  {
    id: '2',
    name: 'Ana García',
    username: '@anagarcia',
    email: 'ana@example.com',
    status: 'offline',
    lastSeen: 'Hace 2 horas'
  },
  {
    id: '3',
    name: 'Luis Torres',
    username: '@luist',
    email: 'luis@example.com',
    status: 'online'
  }
];

const mockAllUsers: Friend[] = [
  ...mockFriends,
  {
    id: '4',
    name: 'María López',
    username: '@marialop',
    email: 'maria@example.com',
    status: 'offline'
  },
  {
    id: '5',
    name: 'Pedro Ramírez',
    username: '@pedror',
    email: 'pedro@example.com',
    status: 'online'
  },
  {
    id: '6',
    name: 'Sofia Vargas',
    username: '@sofiv',
    email: 'sofia@example.com',
    status: 'offline'
  }
];

export function MatchesProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([
    {
      id: '1',
      name: 'Pichanga del Viernes',
      fieldName: 'Cancha La Bombonera',
      location: 'San Isidro',
      date: 'Vie, 13 Oct',
      time: '18:00',
      duration: 1,
      type: 'Fútbol 7v7',
      status: 'upcoming',
      players: 8,
      maxPlayers: 14,
      hasRival: false,
      chatId: 'chat-1'
    }
  ]);

  const [chats, setChats] = useState<MatchChat[]>([
    {
      id: 'chat-1',
      matchId: '1',
      matchName: 'Pichanga del Viernes',
      lastMessage: 'Nos vemos mañana!',
      lastMessageTime: '10:30 AM',
      unreadCount: 2,
      isPermanent: true
    }
  ]);

  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [matchInvitations, setMatchInvitations] = useState<MatchInvitation[]>([]);

  const addMatch = (match: Match) => {
    setMatches(prev => [match, ...prev]);
  };

  const addChat = (chat: MatchChat) => {
    setChats(prev => {
      const exists = prev.find(c => c.id === chat.id);
      if (exists) return prev;
      
      // Remove expired pending chats
      const filteredChats = prev.filter(c => {
        if (!c.isPermanent && c.expiresAt) {
          return new Date() < c.expiresAt;
        }
        return true;
      });
      
      return [chat, ...filteredChats];
    });
  };

  const searchUsers = (query: string): Friend[] => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return mockAllUsers.filter(
      user => 
        !friends.find(f => f.id === user.id) &&
        (user.name.toLowerCase().includes(lowerQuery) ||
         user.username.toLowerCase().includes(lowerQuery) ||
         user.email.toLowerCase().includes(lowerQuery))
    );
  };

  const sendFriendRequest = (friendId: string) => {
    const friend = mockAllUsers.find(u => u.id === friendId);
    if (!friend) return;

    const currentUser: Friend = {
      id: 'current',
      name: 'Juan Pérez',
      username: '@juanperez',
      email: 'juan@example.com',
      status: 'online'
    };

    const request: FriendRequest = {
      id: `req-${Date.now()}`,
      from: currentUser,
      to: friend,
      status: 'pending',
      sentAt: new Date()
    };

    setSentRequests(prev => [request, ...prev]);
  };

  const acceptFriendRequest = (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (!request) return;

    setFriends(prev => [...prev, request.from]);
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const rejectFriendRequest = (requestId: string) => {
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const removeFriend = (friendId: string) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
  };

  const inviteFriendsToMatch = (matchId: string, friendIds: string[]) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const currentUser: Friend = {
      id: 'current',
      name: 'Juan Pérez',
      username: '@juanperez',
      email: 'juan@example.com',
      status: 'online'
    };

    const newInvitations: MatchInvitation[] = friendIds.map(friendId => ({
      id: `inv-${Date.now()}-${friendId}`,
      matchId,
      matchName: match.name,
      from: currentUser,
      status: 'pending',
      sentAt: new Date()
    }));

    setMatchInvitations(prev => [...newInvitations, ...prev]);
    
    // Simulate push notification
    console.log(`Notificaciones enviadas a ${friendIds.length} amigos para el partido "${match.name}"`);
  };

  const acceptMatchInvitation = (invitationId: string) => {
    const invitation = matchInvitations.find(inv => inv.id === invitationId);
    if (!invitation) return;

    // Update invitation status
    setMatchInvitations(prev => 
      prev.map(inv => inv.id === invitationId ? { ...inv, status: 'accepted' } : inv)
    );

    // Add match to user's matches
    const match = matches.find(m => m.id === invitation.matchId);
    if (match) {
      addMatch({ ...match });
      
      // Add user to chat
      const chat = chats.find(c => c.matchId === match.id);
      if (chat) {
        console.log(`Usuario añadido al chat del partido "${match.name}"`);
      }
    }
  };

  const rejectMatchInvitation = (invitationId: string) => {
    setMatchInvitations(prev =>
      prev.map(inv => inv.id === invitationId ? { ...inv, status: 'rejected' } : inv)
    );
  };

  return (
    <MatchesContext.Provider
      value={{
        matches,
        chats,
        friends,
        friendRequests,
        sentRequests,
        matchInvitations,
        addMatch,
        addChat,
        searchUsers,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        inviteFriendsToMatch,
        acceptMatchInvitation,
        rejectMatchInvitation
      }}
    >
      {children}
    </MatchesContext.Provider>
  );
}

export function useMatches() {
  const context = useContext(MatchesContext);
  if (context === undefined) {
    throw new Error('useMatches must be used within a MatchesProvider');
  }
  return context;
}
