import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar, MapPin, Users as UsersIcon, Search, UserPlus } from "lucide-react";
import { ChatConversationScreen } from "./ChatConversationScreen";
import { CreateSearchScreen } from "./CreateSearchScreen";
import { FriendsScreen } from "./FriendsScreen";

interface ChatScreenProps {
  matchName?: string;
}

interface MatchChat {
  id: string;
  matchName: string;
  fieldName: string;
  location: string;
  date: string;
  time: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  expiresAt: Date;
}

export function ChatScreen({ matchName }: ChatScreenProps) {
  const [matchChats, setMatchChats] = useState<MatchChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<MatchChat | null>(null);
  const [showCreateSearch, setShowCreateSearch] = useState(false);
  const [selectedMatchForSearch, setSelectedMatchForSearch] = useState<MatchChat | null>(null);
  const [showFriends, setShowFriends] = useState(false);

  useEffect(() => {
    // Si hay un nuevo partido creado, agregarlo a la lista
    if (matchName) {
      const newChat: MatchChat = {
        id: Date.now().toString(),
        matchName: matchName,
        fieldName: 'Canchita La Merced',
        location: 'Tahuaycani',
        date: 'Hoy',
        time: '18:00',
        lastMessage: 'Reserva confirmada! Invita a tus amigos al partido',
        timestamp: 'Ahora',
        unread: 0,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Solo expira si es "Pagar Después"
      };
      
      setMatchChats(prev => [newChat, ...prev]);
    }
  }, [matchName]);

  // Clean up expired pending chats
  useEffect(() => {
    const interval = setInterval(() => {
      setMatchChats(prev => prev.filter(chat => {
        // Keep chats that haven't expired or don't have expiration
        if (!chat.expiresAt) return true;
        return new Date() < chat.expiresAt;
      }));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const permanentChats = [
    {
      id: '1',
      name: 'Cancha La Merced',
      lastMessage: 'Tu reserva ha sido confirmada',
      time: 'Ayer',
      unread: 0,
      type: 'venue'
    }
  ];

  if (showFriends) {
    return <FriendsScreen onBack={() => setShowFriends(false)} />;
  }

  if (showCreateSearch && selectedMatchForSearch) {
    return (
      <CreateSearchScreen
        matchName={selectedMatchForSearch.matchName}
        fieldName={selectedMatchForSearch.fieldName}
        date={selectedMatchForSearch.date}
        time={selectedMatchForSearch.time}
        onBack={() => {
          setShowCreateSearch(false);
          setSelectedMatchForSearch(null);
        }}
        onPublish={(type, data) => {
          // Handle publish logic
          console.log('Publishing search:', type, data);
          setShowCreateSearch(false);
          setSelectedMatchForSearch(null);
        }}
      />
    );
  }

  if (selectedChat) {
    return (
      <ChatConversationScreen
        chatId={selectedChat.id}
        chatTitle={selectedChat.matchName}
        chatSubtitle={`${selectedChat.fieldName} • ${selectedChat.date} ${selectedChat.time}`}
        onBack={() => setSelectedChat(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4">
        <h1 className="text-2xl mb-6">Mensajes</h1>

        {/* Friends Button */}
        <Button
          onClick={() => setShowFriends(true)}
          className="w-full bg-[#047857] hover:bg-[#047857]/90 h-12 mb-6"
        >
          <UserPlus size={20} className="mr-2" />
          Gestionar Amigos
        </Button>

        {/* Chats de Partidos */}
        {matchChats.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 flex items-center gap-2">
              <UsersIcon size={18} className="text-[#047857]" />
              Chats de Partidos
            </h3>
            <div className="space-y-2">
              {matchChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className="border-2 border-[#047857] rounded-xl p-4 hover:bg-secondary cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="mb-1">{chat.matchName}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{chat.fieldName}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-[#047857] text-white hover:bg-[#047857]/90">
                      Activo
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{chat.date}</span>
                    </div>
                    <span>•</span>
                    <span>{chat.time}</span>
                  </div>

                  <div className="bg-muted rounded-lg p-3 mb-3">
                    <p className="text-sm">{chat.lastMessage}</p>
                    <p className="text-xs text-muted-foreground mt-1">{chat.timestamp}</p>
                  </div>

                  {/* Configure Search Button */}
                  <Button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      setSelectedMatchForSearch(chat);
                      setShowCreateSearch(true);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Search size={16} className="mr-2" />
                    Configurar Búsqueda
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensajes Permanentes */}
        <div>
          <h3 className="mb-3">Otros Mensajes</h3>
          <div className="space-y-1">
            {permanentChats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-[#047857] text-white">
                    {chat.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="truncate">{chat.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">{chat.time}</p>
                  {chat.unread > 0 && (
                    <Badge className="bg-[#047857] text-white h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {chat.unread}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estado vacío */}
        {matchChats.length === 0 && (
          <div className="text-center py-16">
            <UsersIcon size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="mb-2">No tienes partidos próximos</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Reserva una cancha y se creará automáticamente un chat para coordinar con tus amigos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
