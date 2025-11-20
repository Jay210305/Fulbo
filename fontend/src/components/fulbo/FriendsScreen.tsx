import { useState } from "react";
import { ArrowLeft, Search, UserPlus, Check, X, Trash2, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useMatches, Friend } from "../../contexts/MatchesContext";

interface FriendsScreenProps {
  onBack: () => void;
}

export function FriendsScreen({ onBack }: FriendsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);
  
  const {
    friends,
    friendRequests,
    sentRequests,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend
  } = useMatches();

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const results = searchUsers(searchQuery);
    setSearchResults(results);
  };

  const handleAddFriend = (friendId: string) => {
    sendFriendRequest(friendId);
    setSearchResults(prev => prev.filter(f => f.id !== friendId));
  };

  const handleRemoveFriend = (friend: Friend) => {
    setFriendToRemove(friend);
  };

  const confirmRemoveFriend = () => {
    if (friendToRemove) {
      removeFriend(friendToRemove.id);
      setFriendToRemove(null);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>Mis Amigos</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Search Section */}
        <div className="space-y-3">
          <h3>Buscar y Añadir Amigos</h3>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar por nombre de usuario o email"
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} className="bg-[#047857] hover:bg-[#047857]/90">
              Buscar
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Resultados de búsqueda:</p>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-[#047857] text-white">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.username}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAddFriend(user.id)}
                    size="sm"
                    className="bg-[#047857] hover:bg-[#047857]/90"
                  >
                    <UserPlus size={16} className="mr-1" />
                    Añadir
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No se encontraron usuarios
            </p>
          )}
        </div>

        {/* Tabs for Requests and Friends */}
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">
              Amigos ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="received">
              Recibidas ({friendRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Enviadas ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* Friends List */}
          <TabsContent value="friends" className="space-y-3 mt-4">
            {friends.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">No tienes amigos aún</p>
                <p className="text-sm text-muted-foreground">
                  Busca usuarios y añádelos como amigos
                </p>
              </div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="bg-[#047857] text-white text-lg">
                        {friend.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p>{friend.name}</p>
                      <p className="text-sm text-muted-foreground">{friend.username}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {friend.status === 'online' ? (
                          <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none text-xs">
                            En línea
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={12} />
                            {friend.lastSeen || 'Desconectado'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRemoveFriend(friend)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))
            )}
          </TabsContent>

          {/* Received Requests */}
          <TabsContent value="received" className="space-y-3 mt-4">
            {friendRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tienes solicitudes pendientes</p>
              </div>
            ) : (
              friendRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border-2 border-[#047857] rounded-lg bg-secondary"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-[#047857] text-white">
                        {request.from.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{request.from.name}</p>
                      <p className="text-sm text-muted-foreground">{request.from.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => acceptFriendRequest(request.id)}
                      size="sm"
                      className="bg-[#047857] hover:bg-[#047857]/90"
                    >
                      <Check size={16} className="mr-1" />
                      Aceptar
                    </Button>
                    <Button
                      onClick={() => rejectFriendRequest(request.id)}
                      size="sm"
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <X size={16} className="mr-1" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Sent Requests */}
          <TabsContent value="sent" className="space-y-3 mt-4">
            {sentRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No has enviado solicitudes</p>
              </div>
            ) : (
              sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {request.to.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{request.to.name}</p>
                      <p className="text-sm text-muted-foreground">{request.to.username}</p>
                    </div>
                  </div>
                  <Badge variant="outline">Pendiente</Badge>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Remove Friend Confirmation Dialog */}
      <AlertDialog open={!!friendToRemove} onOpenChange={() => setFriendToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Amigo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas eliminar a {friendToRemove?.name} de tu lista de amigos?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveFriend}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
