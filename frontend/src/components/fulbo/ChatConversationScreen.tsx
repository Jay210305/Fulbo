import { useState, useRef, useEffect } from "react";
import { ArrowLeft, MoreVertical, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
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
  _id?: string; // Optional for Mongo ID
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
  const { user } = useUser(); // Current logged in user
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Logic: Socket Connection & Data Fetching ---

  useEffect(() => {
    // 1. Fetch Chat History
    fetch(`${SOCKET_URL}/api/chats/${chatId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        // Format Mongo messages for the UI
        const formatted: Message[] = data.map((msg: any) => ({
          id: msg._id,
          text: msg.content, // Assuming backend sends 'content' or 'message'
          sender: msg.senderId === user.email ? "me" : "other",
          senderName:
            msg.senderId === user.email ? "Yo" : msg.senderId.split("@")[0], // derived name
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar:
            msg.senderId === user.email
              ? undefined
              : msg.senderId.charAt(0).toUpperCase(),
        }));
        setMessages(formatted);
      })
      .catch(console.error);

    // 2. Initialize Socket
    socketRef.current = io(SOCKET_URL);

    // Join Room
    socketRef.current.emit("join_room", chatId);

    // Listen for incoming messages
    socketRef.current.on("receive_message", (data) => {
      const incomingMsg: Message = {
        id: data._id || Date.now().toString(),
        text: data.message,
        sender: data.senderId === user.email ? "me" : "other",
        senderName:
          data.senderId === user.email ? "Yo" : data.senderId.split("@")[0],
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        avatar:
          data.senderId === user.email
            ? undefined
            : data.senderId.charAt(0).toUpperCase(),
      };

      setMessages((prev) => [...prev, incomingMsg]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [chatId, user.email]);

  // --- Logic: Auto Scroll ---

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- Logic: Sending Messages ---

  const handleSendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      const messageData = {
        roomId: chatId,
        message: newMessage,
        senderId: user.email,
      };

      // Emit to server
      socketRef.current.emit("send_message", messageData);

      // Note: We don't manually append to state here because we expect
      // the server to broadcast it back via 'receive_message'.
      // If your server DOES NOT echo back to sender, uncomment the line below:
      // setMessages(prev => [...prev, { ...tempMessageObject }]);

      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- UI: Rendering ---

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 z-10">
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
            <h2 className="truncate text-base">{chatTitle}</h2>
            {chatSubtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {chatSubtitle}
              </p>
            )}
          </div>

          <button className="p-2 hover:bg-muted rounded-full">
            <MoreVertical size={20} />
          </button>
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
              key={message.id}
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
      <div className="sticky bottom-0 bg-white border-t border-border p-4">
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
