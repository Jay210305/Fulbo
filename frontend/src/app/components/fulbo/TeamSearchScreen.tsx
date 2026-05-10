import { useState } from "react";
import { ArrowLeft, Clock, MapPin, Users, Trophy, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { SearchEventDetailScreen } from "./SearchEventDetailScreen";
import { SearchEvent } from "../../types/field";
import { useMatches } from "../../contexts/MatchesContext";

interface TeamSearchScreenProps {
  onBack: () => void;
  onJoinTeam?: (chatName: string) => void;
}

const mockSearchEvents: SearchEvent[] = [
  {
    id: '1',
    type: 'players',
    creatorName: 'El Pecho Frio',
    creatorTeamName: 'El Pecho Frio FC',
    teamLevel: 'intermedio',
    matchName: 'Pichanga del Viernes',
    fieldName: 'Cancha La Merced',
    location: 'Tahuaycani',
    date: 'Vie, 18 Oct',
    time: '18:30',
    duration: 1,
    fieldType: 'Fútbol 7v7',
    playersNeeded: 2,
    positionNeeded: 'Defensa',
    message: 'Nos faltan 2 defensas para completar el equipo. Juego relajado pero competitivo. ¡Traigan hidratación!',
    currentPlayers: 12,
    maxPlayers: 14
  },
  {
    id: '2',
    type: 'players',
    creatorName: 'Uva Volley',
    teamLevel: 'principiante',
    matchName: 'Sábado casual',
    fieldName: 'Arena Futsal Pro',
    location: 'Centro',
    date: 'Sáb, 19 Oct',
    time: '19:30',
    duration: 1,
    fieldType: 'Fútbol 5v5',
    playersNeeded: 1,
    positionNeeded: 'cualquier',
    message: 'Buscamos un jugador más para completar. Juego casual y divertido, todos los niveles bienvenidos.',
    currentPlayers: 9,
    maxPlayers: 10
  },
  {
    id: '3',
    type: 'players',
    creatorName: 'Los Paquetes',
    creatorTeamName: 'Los Paquetes United',
    teamLevel: 'avanzado',
    matchName: 'Match Competitivo',
    fieldName: 'Cancha Los Pinos',
    location: 'Centro',
    date: 'Dom, 20 Oct',
    time: '20:30',
    duration: 2,
    fieldType: 'Fútbol 11v11',
    playersNeeded: 3,
    positionNeeded: 'Mediocampista',
    message: 'Necesitamos 3 mediocampistas para partido competitivo. Nivel alto requerido.',
    currentPlayers: 19,
    maxPlayers: 22
  },
  {
    id: '4',
    type: 'rival',
    creatorName: 'Andre Cuba',
    creatorTeamName: 'Los Buitres FC',
    teamLevel: 'intermedio',
    matchName: 'Reto Los Buitres',
    fieldName: 'Estadio Zona Sur',
    location: 'Santa Bárbara',
    date: 'Vie, 18 Oct',
    time: '18:30',
    duration: 1,
    fieldType: 'Fútbol 7v7',
    message: 'Buscamos equipo rival de nivel intermedio para una pichanga relajada. Tenemos 7 jugadores listos. ¡Anímense!'
  },
  {
    id: '5',
    type: 'rival',
    creatorName: 'Ronny Diego Trevillo',
    teamLevel: 'principiante',
    matchName: 'Desafío Amistoso',
    fieldName: 'Cancha Central',
    location: 'Centro',
    date: 'Sáb, 19 Oct',
    time: '19:30',
    duration: 1.5,
    fieldType: 'Fútbol 5v5',
    message: 'Partido amistoso, buscamos rival de nivel principiante. Queremos divertirnos y mejorar.'
  },
  {
    id: '6',
    type: 'rival',
    creatorName: 'Leo Delgado',
    creatorTeamName: 'Galácticos FC',
    teamLevel: 'avanzado',
    matchName: 'Partido de Alto Nivel',
    fieldName: 'Complejo Deportivo Norte',
    location: 'Tahuaycani',
    date: 'Dom, 20 Oct',
    time: '21:00',
    duration: 2,
    fieldType: 'Fútbol 11v11',
    message: 'Buscamos equipo de nivel avanzado para partido competitivo. Juego serio, árbitro incluido.'
  }
];

export function TeamSearchScreen({ onBack, onJoinTeam }: TeamSearchScreenProps) {
  const [selectedEvent, setSelectedEvent] = useState<SearchEvent | null>(null);

  const { addMatch, addChat } = useMatches();

  const handleJoinEvent = (event: SearchEvent) => {
    // Add match to "Mis Próximos Partidos"
    const newMatch = {
      id: `match-${Date.now()}`,
      name: event.matchName,
      fieldName: event.fieldName,
      location: event.location,
      date: event.date,
      time: event.time,
      duration: event.duration,
      type: event.fieldType,
      status: 'upcoming' as const,
      players: event.currentPlayers,
      maxPlayers: event.maxPlayers,
      hasRival: event.type === 'rival',
      chatId: `chat-${Date.now()}`
    };
    
    addMatch(newMatch);
    
    // Add chat for the match - marked as permanent (won't expire)
    const newChat = {
      id: newMatch.chatId,
      matchId: newMatch.id,
      matchName: event.matchName,
      lastMessage: `Te has unido al ${event.type === 'players' ? 'equipo' : 'reto'}!`,
      lastMessageTime: 'Ahora',
      unreadCount: 0,
      isPermanent: true // Chats de partidos confirmados son permanentes
    };
    
    addChat(newChat);
    
    // Show notification
    alert(`¡Te has unido exitosamente! El partido "${event.matchName}" se ha agregado a "Mis Partidos". Serás redirigido al chat del equipo.`);
    
    // Redirect to chat
    setSelectedEvent(null);
    onBack();
    onJoinTeam?.(event.matchName);
  };

  if (selectedEvent) {
    return (
      <SearchEventDetailScreen
        event={selectedEvent}
        onBack={() => setSelectedEvent(null)}
        onJoin={handleJoinEvent}
      />
    );
  }

  const playerSearchEvents = mockSearchEvents.filter(e => e.type === 'players');
  const rivalSearchEvents = mockSearchEvents.filter(e => e.type === 'rival');

  const getLevelBadgeColor = (level: string) => {
    const colors = {
      principiante: 'bg-blue-500 hover:bg-blue-500/90',
      intermedio: 'bg-orange-500 hover:bg-orange-500/90',
      avanzado: 'bg-red-500 hover:bg-red-500/90'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2>Buscar Equipo / Rival</h2>
          <p className="text-sm text-muted-foreground">Encuentra tu próximo partido</p>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="teams">Jugadores Faltantes</TabsTrigger>
            <TabsTrigger value="rivals">Desafíos / Rivales</TabsTrigger>
          </TabsList>

          {/* Jugadores Faltantes */}
          <TabsContent value="teams" className="space-y-3">
            <div className="bg-secondary border border-[#047857] rounded-xl p-3 mb-4">
              <p className="text-sm">
                <strong>Únete a un equipo</strong> que necesita completar jugadores para su partido
              </p>
            </div>

            {playerSearchEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="bg-white border border-border rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="bg-[#047857] text-white text-lg">
                      {event.creatorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="mb-1">{event.matchName}</h4>
                        <p className="text-sm text-muted-foreground">{event.creatorName}</p>
                      </div>
                      <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none ml-2 flex items-center gap-1 flex-shrink-0">
                        <Users size={14} />
                        Busca {event.playersNeeded}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getLevelBadgeColor(event.teamLevel)} text-white border-none text-xs`}>
                        <TrendingUp size={12} className="mr-1" />
                        {event.teamLevel.charAt(0).toUpperCase() + event.teamLevel.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{event.fieldType}</span>
                    </div>

                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Desafíos / Rivales */}
          <TabsContent value="rivals" className="space-y-3">
            <div className="bg-secondary border border-[#047857] rounded-xl p-3 mb-4">
              <p className="text-sm">
                <strong>Reta a otro equipo</strong> y organiza un partido completo
              </p>
            </div>

            {rivalSearchEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="bg-white border border-border rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="bg-purple-600 text-white text-lg">
                      {event.creatorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="mb-1">{event.matchName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {event.creatorTeamName || event.creatorName}
                        </p>
                      </div>
                      <Badge className="bg-purple-600 hover:bg-purple-600/90 text-white border-none ml-2 flex-shrink-0">
                        <Trophy size={14} className="mr-1" />
                        Busca Rival
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getLevelBadgeColor(event.teamLevel)} text-white border-none text-xs`}>
                        <TrendingUp size={12} className="mr-1" />
                        {event.teamLevel.charAt(0).toUpperCase() + event.teamLevel.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{event.fieldType}</span>
                    </div>

                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
