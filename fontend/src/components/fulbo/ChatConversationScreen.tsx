import { useState, useRef, useEffect } from "react";
import { ArrowLeft, MoreVertical, Send, Image, Smile } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface ChatConversationScreenProps {
  chatId: string;
  chatTitle: string;
  chatSubtitle?: string;
  onBack: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  senderName?: string;
  timestamp: string;
  avatar?: string;
}

export function ChatConversationScreen({ chatId, chatTitle, chatSubtitle, onBack }: ChatConversationScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! ¿Todos listos para el partido?',
      sender: 'other',
      senderName: 'Carlos M.',
      timestamp: '10:30',
      avatar: 'C'
    },
    {
      id: '2',
      text: 'Sí, confirmado! Nos vemos a las 18:00',
      sender: 'me',
      timestamp: '10:32'
    },
    {
      id: '3',
      text: 'Perfecto, llevo los balones',
      sender: 'other',
      senderName: 'Miguel R.',
      timestamp: '10:35',
      avatar: 'M'
    },
    {
      id: '4',
      text: 'Excelente! No olviden las canilleras',
      sender: 'me',
      timestamp: '10:36'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const now = new Date();
      const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
      
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'me',
        timestamp: time
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-muted rounded-full -ml-2">
            <ArrowLeft size={20} />
          </button>
          
          <Avatar className="w-10 h-10 bg-[#047857]">
            <AvatarFallback className="bg-[#047857] text-white">
              {chatTitle.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h2 className="truncate text-base">{chatTitle}</h2>
            {chatSubtitle && (
              <p className="text-xs text-muted-foreground truncate">{chatSubtitle}</p>
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
          const showAvatar = message.sender === 'other' && 
            (index === 0 || messages[index - 1].sender !== 'other' || messages[index - 1].senderName !== message.senderName);
          
          const showName = message.sender === 'other' && showAvatar;

          return (
            <div
              key={message.id}
              className={`flex gap-2 ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'other' && (
                <div className="w-8 flex-shrink-0">
                  {showAvatar && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                        {message.avatar || message.senderName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              )}

              <div className={`flex flex-col max-w-[75%] ${message.sender === 'me' ? 'items-end' : 'items-start'}`}>
                {showName && (
                  <p className="text-xs text-muted-foreground mb-1 ml-2">
                    {message.senderName}
                  </p>
                )}
                
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    message.sender === 'me'
                      ? 'bg-[#047857] text-white rounded-br-sm'
                      : 'bg-white text-foreground border border-border rounded-bl-sm'
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
                ? 'bg-[#047857] text-white hover:bg-[#047857]/90'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
