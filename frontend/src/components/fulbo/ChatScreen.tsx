import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Calendar,
  MapPin,
  Users as UsersIcon,
  Search,
  UserPlus,
  MessageSquarePlus,
} from "lucide-react";
import { ChatConversationScreen } from "./ChatConversationScreen";
import { CreateSearchScreen } from "./CreateSearchScreen";
import { FriendsScreen } from "./FriendsScreen";
import { useUser } from "../../contexts/UserContext";
import { io, Socket } from "socket.io-client";

// Interface merging both requirements: UI needs + Backend response
interface ChatData {
  id: string; // Maps to roomId
  matchName: string; // Maps to name
  fieldName: string; // Placeholder or future backend field
  location: string; // Placeholder or future backend field
  date: string; // Placeholder or future backend field
  time: string; // Placeholder or future backend field
  lastMessage: string; // Placeholder or future backend field
  timestamp: string;
  unread: number;
  members?: string[];
}

const API_URL = "http://localhost:4000/api";
const SOCKET_URL = "http://localhost:4000";

interface ChatScreenProps {
  matchName?: string; // Optional prop to trigger refresh after booking
}

export function ChatScreen({ matchName }: ChatScreenProps = {}) {
  const { user } = useUser();
  const socketRef = useRef<Socket | null>(null);

  // --- State ---
  const [chats, setChats] = useState<ChatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Navigation State (from Original)
  const [selectedChat, setSelectedChat] = useState<ChatData | null>(null);
  const [showCreateSearch, setShowCreateSearch] = useState(false);
  const [selectedMatchForSearch, setSelectedMatchForSearch] =
    useState<ChatData | null>(null);
  const [showFriends, setShowFriends] = useState(false);

  // Function to fetch chats - extracted for reuse
  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();

        // Map backend data to UI Interface
        // Note: Since backend currently returns { roomId, name, members },
        // we fill missing UI fields with placeholders until backend is updated.
        interface ApiChat {
          roomId: string;
          name?: string;
          members?: string[];
        }
        const formattedChats: ChatData[] = data.map((chat: ApiChat) => ({
          id: chat.roomId,
          matchName: chat.name || "Partido sin nombre",
          fieldName: "Cancha", // Default text until backend sends venue
          location: "Ver detalles",
          date: "Próximamente",
          time: "--:--",
          lastMessage: `${chat.members?.length || 0} miembros en el chat`,
          timestamp: "Hoy",
          unread: 0,
          members: chat.members,
        }));

        setChats(formattedChats);
      } else if (res.status === 401) {
        // Token expired or invalid - user needs to re-login
        console.error("Sesión expirada, por favor inicia sesión nuevamente");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
      } else {
        console.error("Error cargando chats");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Logic: Fetch Data on mount and when dependencies change ---
  useEffect(() => {
    fetchChats();
  }, [user, refreshTrigger]); // Re-fetch if user context changes or refresh triggered

  // --- Trigger refresh when matchName prop changes (after booking) ---
  useEffect(() => {
    if (matchName) {
      // Small delay to ensure backend has created the chat room
      const timer = setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [matchName]);

  // --- Socket connection for real-time chat list updates ---
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    // Listen for new chat room created events (for when you're added to a new room)
    socketRef.current.on("chat_room_updated", () => {
      setRefreshTrigger(prev => prev + 1);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // --- Conditional Rendering for Sub-screens (from Original) ---

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
          console.log("Publishing search:", type, data);
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
        chatSubtitle={`${selectedChat.fieldName} • ${
          selectedChat.members?.length || 0
        } miembros`}
        onBack={() => setSelectedChat(null)}
      />
    );
  }

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-white pb-20 flex flex-col">
      <div className="p-4 flex-1 flex flex-col">
        {/* Header */}
        <h1 className="text-2xl mb-4 font-bold">Mensajes</h1>

        {/* Search Bar (from New Code) */}
        <div className="relative mb-6">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Buscar conversación..."
            className="pl-10 bg-gray-100 border-none rounded-xl"
          />
        </div>

        {/* Friends Button */}
        <Button
          onClick={() => setShowFriends(true)}
          className="w-full bg-[#047857] hover:bg-[#047857]/90 h-12 mb-6"
        >
          <UserPlus size={20} className="mr-2" />
          Gestionar Amigos
        </Button>

        {/* Content Area */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">
              Cargando chats...
            </div>
          ) : chats.length > 0 ? (
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium mb-3">
                <UsersIcon size={18} className="text-[#047857]" />
                Mis Partidos
              </h3>

              <div className="space-y-3">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 cursor-pointer transition-colors shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">
                          {chat.matchName}
                        </h4>
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

                    <div className="bg-muted/50 rounded-lg p-3 mb-3">
                      <p className="text-sm truncate">{chat.lastMessage}</p>
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        {chat.timestamp}
                      </p>
                    </div>

                    {/* Configure Search Button */}
                    <Button
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        setSelectedMatchForSearch(chat);
                        setShowCreateSearch(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-9"
                    >
                      <Search size={14} className="mr-2" />
                      Buscar jugadores para este partido
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquarePlus
                size={64}
                className="text-muted-foreground mb-4 opacity-50"
              />
              <h3 className="mb-2 font-semibold">
                No tienes partidos próximos
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Reserva una cancha y se creará automáticamente un chat para
                coordinar con tus amigos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
