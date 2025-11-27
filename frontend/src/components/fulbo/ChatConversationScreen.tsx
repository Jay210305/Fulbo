import { useState, useRef, useEffect } from "react";
import { ArrowLeft, MoreVertical, Send, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { io, Socket } from "socket.io-client";
import { useUser } from "../../contexts/UserContext";

interface ChatConversationScreenProps {
  chatId: string; // This corresponds to the roomId (booking_id)
  chatTitle: string;
  chatSubtitle?: string;
  onBack: () => void;
}

interface Message {
  id: string;
  _id?: string;
  text: string;
  sender: "me" | "other";
  senderName?: string;
  timestamp: string;
  avatar?: string;
}

// Backend URL
const SOCKET_URL = "http://localhost:4000";

export function ChatConversationScreen({
  chatId,
  chatTitle,
  chatSubtitle,
  onBack,
}: ChatConversationScreenProps) {
  const { user } = useUser();
  
  // --- State ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  // Invite User State
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Logic: Socket Connection & Data Fetching ---
  useEffect(() => {
    // 1. Fetch Chat History
    fetch(`${SOCKET_URL}/api/chats/${chatId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        const formatted: Message[] = data.map((msg: any) => ({
          id: msg._id,
          text: msg.content,
          sender: msg.senderId === user.email ? "me" : "other",
          senderName: msg.senderId === user.email ? "Yo" : msg.senderId.split("@")[0],
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar: msg.senderId === user.email ? undefined : msg.senderId.charAt(0).toUpperCase(),
        }));
        setMessages(formatted);
      })
      .catch(console.error);

    // 2. Initialize Socket
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("join_room", chatId);

    // 3. Listen for incoming messages
    socketRef.current.on("receive_message", (data) => {
      const incomingMsg: Message = {
        id: data._id || Date.now().toString(),
        text: data.message,
        sender: data.senderId === user.email ? "me" : "other",
        senderName: data.senderId === user.email ? "Yo" : data.senderId.split("@")[0],
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        avatar: data.senderId === user.email ? undefined : data.senderId.charAt(0).toUpperCase(),
      };
      setMessages((prev) => [...prev, incomingMsg]);
    });

    // 4. Auto-add self to room (Logic from Code 2)
    // This ensures the user appears in the member list if they aren't already
    const token = localStorage.getItem('token');
    if (token) {
        fetch(`${SOCKET_URL}/api/chats/${chatId}/users`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email: user.email })
        }).catch(console.error);
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [chatId, user.email]);

  // --- Logic: Auto Scroll ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Logic: Sending Messages ---
  const handleSendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      const messageData = {
        roomId: chatId,
        message: newMessage,
        senderId: user.email,
      };
      socketRef.current.emit("send_message", messageData);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- Logic: Invite User (From Code 2) ---
  const handleInviteUser = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${SOCKET_URL}/api/chats/${chatId}/users`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email: inviteEmail })
        });
        if (res.ok) {
            alert(`Usuario ${inviteEmail} agregado exitosamente.`);
            setIsInviteOpen(false);
            setInviteEmail('');
        } else {
            alert("Error al agregar usuario.");
        }
    } catch (e) {
        console.error(e);
        alert("Error de conexión");
    }
  };

  // --- Render ---
  return (
    // Fixed inset-0 ensures it covers the bottom nav bar (mobile fix)
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-[100dvh]">
      
      {/* Header */}
      <div className="bg-white border-b border-border p-4 z-10 shadow-sm flex-none">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-full -ml-2"
          >
            <ArrowLeft size={20} />
          </button>

          <Avatar className="w-10 h-10 bg-[#047857]">
            <AvatarFallback className="bg-[#047857] text-white">
              {chatTitle.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h2 className="truncate text-base font-semibold">{chatTitle}</h2>
            {chatSubtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {chatSubtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
             {/* Invite User Modal Trigger */}
             <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                    <button className="p-2 hover:bg-muted rounded-full text-[#047857]">
                        <UserPlus size={20} />
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar persona al chat</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-gray-500">
                            Ingresa el correo electrónico del usuario que deseas invitar.
                        </p>
                        <Input 
                            placeholder="ejemplo@correo.com" 
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                        />
                        <Button 
                            onClick={handleInviteUser} 
                            className="w-full bg-[#047857] hover:bg-[#047857]/90"
                        >
                            Agregar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <button className="p-2 hover:bg-muted rounded-full">
                <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => {
          // Logic to show avatar only on the first message of a sequence from 'other'
          const showAvatar =
            message.sender === "other" &&
            (index === 0 ||
              messages[index - 1].sender !== "other" ||
              messages[index - 1].senderName !== message.senderName);

          const showName = message.sender === "other" && showAvatar;

          return (
            <div
              key={message.id || index}
              className={`flex gap-2 ${
                message.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender === "other" && (
                <div className="w-8 flex-shrink-0">
                  {showAvatar && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                        {message.avatar || message.senderName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              )}

              <div
                className={`flex flex-col max-w-[75%] ${
                  message.sender === "me" ? "items-end" : "items-start"
                }`}
              >
                {showName && (
                  <p className="text-xs text-muted-foreground mb-1 ml-2">
                    {message.senderName}
                  </p>
                )}

                <div
                  className={`rounded-2xl px-4 py-2 ${
                    message.sender === "me"
                      ? "bg-[#047857] text-white rounded-br-sm"
                      : "bg-white text-foreground border border-border rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm break-words">{message.text}</p>
                </div>

                <p className="text-xs text-muted-foreground mt-1 mx-2">
                  {message.timestamp}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-border p-4 flex-none safe-area-bottom">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-input-background rounded-full px-4 py-2 flex items-center gap-2">
            <Input
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent border-none h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              newMessage.trim()
                ? "bg-[#047857] text-white hover:bg-[#047857]/90"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}