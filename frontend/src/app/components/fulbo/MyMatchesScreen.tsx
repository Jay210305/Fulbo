import { useState } from "react";
import { ArrowLeft, Calendar, MapPin, Clock, Users, Trophy, MessageCircle, UserPlus, Swords, Shirt } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CreateSearchScreen } from "./CreateSearchScreen";
import { TeamLineupScreen } from "./TeamLineupScreen";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface MyMatchesScreenProps {
  onBack: () => void;
  onOpenChat: (matchId: string) => void;
}

interface Match {
  id: string;
  name: string;
  fieldName: string;
  location: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: 'upcoming' | 'completed';
  players?: number;
  maxPlayers?: number;
  hasRival?: boolean;
}

export function MyMatchesScreen({ onBack, onOpenChat }: MyMatchesScreenProps) {
  const [showCreateSearch, setShowCreateSearch] = useState(false);
  const [showLineup, setShowLineup] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Mock data - en producción vendría del backend
  const upcomingMatches: Match[] = [
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
      hasRival: false
    },
    {
      id: '2',
      name: 'Match del Sábado',
      fieldName: 'Estadio El Monumental',
      location: 'Miraflores',
      date: 'Sáb, 14 Oct',
      time: '16:00',
      duration: 2,
      type: 'Fútbol 11v11',
      status: 'upcoming',
      players: 22,
      maxPlayers: 22,
      hasRival: true
    },
    {
      id: '3',
      name: 'Reto vs Los Cracks',
      fieldName: 'Complejo San Martín',
      location: 'San Miguel',
      date: 'Dom, 15 Oct',
      time: '10:00',
      duration: 1.5,
      type: 'Fútbol 5v5',
      status: 'upcoming',
      players: 10,
      maxPlayers: 10,
      hasRival: true
    }
  ];

  const completedMatches: Match[] = [
    {
      id: '4',
      name: 'Pichanga Amistosa',
      fieldName: 'Cancha Municipal',
      location: 'Surco',
      date: 'Vie, 6 Oct',
      time: '19:00',
      duration: 1,
      type: 'Fútbol 7v7',
      status: 'completed'
    },
    {
      id: '5',
      name: 'Torneo Relámpago',
      fieldName: 'Arena Pro',
      location: 'La Molina',
      date: 'Sáb, 30 Sep',
      time: '14:00',
      duration: 3,
      type: 'Fútbol 11v11',
      status: 'completed'
    }
  ];

  const handleCreateSearch = (match: Match) => {
    setSelectedMatch(match);
    setShowCreateSearch(true);
  };

  if (showLineup && selectedMatch) {
    return (
      <TeamLineupScreen
        matchName={selectedMatch.name}
        matchType={selectedMatch.type}
        matchId={selectedMatch.id}
        onBack={() => {
          setShowLineup(false);
          setSelectedMatch(null);
        }}
        onCreateSearchEvent={() => {
          // Redirect to CreateSearchScreen with "Buscar Rival" pre-selected
          setShowLineup(false);
          setShowCreateSearch(true);
        }}
      />
    );
  }

  if (showCreateSearch && selectedMatch) {
    return (
      <CreateSearchScreen
        matchName={selectedMatch.name}
        fieldName={selectedMatch.fieldName}
        date={selectedMatch.date}
        time={selectedMatch.time}
        preSelectedType="rival" // Pre-seleccionar "Buscar Rival" cuando viene de TeamLineupScreen
        onBack={() => {
          setShowCreateSearch(false);
          setSelectedMatch(null);
        }}
        onPublish={(type, data) => {
          console.log('Published search:', type, data);
          setShowCreateSearch(false);
          setSelectedMatch(null);
          // Aquí se debería actualizar el estado del partido indicando que está buscando rival
          alert('Búsqueda de rival publicada correctamente. Serás notificado cuando un equipo acepte el reto.');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>Mis Partidos</h2>
      </div>

      <div className="p-4">
        <Tabs defaultValue="upcoming">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming">Próximos</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
          </TabsList>

          {/* Upcoming Matches */}
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingMatches.length === 0 ? (
              <div className="text-center py-16">
                <Calendar size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">No tienes partidos próximos</p>
                <p className="text-sm text-muted-foreground">¡Reserva una cancha para empezar!</p>
              </div>
            ) : (
              upcomingMatches.map((match) => (
                <div
                  key={match.id}
                  className="border-2 border-[#047857] rounded-xl p-4 bg-white space-y-4"
                >
                  {/* Match Header */}
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3>{match.name}</h3>
                      <Badge className="bg-[#047857] hover:bg-[#047857]/90 text-white border-none">
                        {match.type}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{match.fieldName} • {match.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{match.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{match.time} • {match.duration}h</span>
                      </div>
                    </div>
                  </div>

                  {/* Players Status */}
                  {match.players && match.maxPlayers && (
                    <div className="bg-secondary rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Jugadores confirmados</span>
                        <span className="text-sm">
                          {match.players}/{match.maxPlayers}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-[#047857] h-2 rounded-full transition-all"
                          style={{ width: `${(match.players / match.maxPlayers) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Rival Status */}
                  {match.hasRival !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      {match.hasRival ? (
                        <>
                          <Badge className="bg-[#34d399] text-white hover:bg-[#34d399]/90 border-none">
                            <Trophy size={14} className="mr-1" />
                            Rival Confirmado
                          </Badge>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Swords size={14} className="mr-1" />
                          Sin rival asignado
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border">
                    {/* Organize Teams Button */}
                    <Button
                      onClick={() => {
                        setSelectedMatch(match);
                        setShowLineup(true);
                      }}
                      variant="outline"
                      className="flex flex-col items-center gap-1 h-auto py-3 border-[#047857] text-[#047857] hover:bg-secondary"
                    >
                      <Shirt size={18} />
                      <span className="text-xs">Organizar</span>
                    </Button>

                    {/* Complete Team Button */}
                    {match.players && match.maxPlayers && match.players < match.maxPlayers && (
                      <Button
                        onClick={() => handleCreateSearch(match)}
                        variant="outline"
                        className="flex flex-col items-center gap-1 h-auto py-3 border-[#047857] text-[#047857] hover:bg-secondary"
                      >
                        <UserPlus size={18} />
                        <span className="text-xs">Completar</span>
                      </Button>
                    )}

                    {/* Search Rival Button */}
                    {!match.hasRival && (
                      <Button
                        onClick={() => handleCreateSearch(match)}
                        variant="outline"
                        className="flex flex-col items-center gap-1 h-auto py-3 border-[#047857] text-[#047857] hover:bg-secondary"
                      >
                        <Trophy size={18} />
                        <span className="text-xs">Rival</span>
                      </Button>
                    )}

                    {/* Open Chat Button */}
                    <Button
                      onClick={() => onOpenChat(match.id)}
                      className="flex flex-col items-center gap-1 h-auto py-3 bg-[#047857] hover:bg-[#047857]/90"
                    >
                      <MessageCircle size={18} />
                      <span className="text-xs">Chat</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Completed Matches */}
          <TabsContent value="completed" className="space-y-4">
            {completedMatches.length === 0 ? (
              <div className="text-center py-16">
                <Trophy size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">No tienes partidos completados</p>
                <p className="text-sm text-muted-foreground">Tu historial aparecerá aquí</p>
              </div>
            ) : (
              completedMatches.map((match) => (
                <div
                  key={match.id}
                  className="border border-border rounded-xl p-4 bg-white opacity-75"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4>{match.name}</h4>
                    <Badge variant="outline">
                      {match.type}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{match.fieldName} • {match.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>{match.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>{match.time} • {match.duration}h</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
