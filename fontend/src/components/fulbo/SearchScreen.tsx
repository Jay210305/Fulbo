import { useState } from "react";
import { Search, MapPin, Users, Filter, Wine, ShoppingCart } from "lucide-react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { FieldMapScreen } from "./FieldMapScreen";
import { TeamSearchScreen } from "./TeamSearchScreen";
import { FullVasoSearchScreen } from "./FullVasoSearchScreen";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { mockFields } from "../../types/field";
import { useCart } from "../../contexts/CartContext";

interface SearchScreenProps {
  onFieldClick?: (fieldId: string) => void;
  onCartClick?: () => void;
  onJoinTeam?: (chatName: string) => void;
}

export function SearchScreen({ onFieldClick, onCartClick, onJoinTeam }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showTeamSearch, setShowTeamSearch] = useState(false);
  const [showFullVasoSearch, setShowFullVasoSearch] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('canchas');
  const { getTotalItems, cart } = useCart();
  const totalItems = getTotalItems();
  const hasReservation = cart.field && cart.selectedTime;

  // Ensure selectedFilters is always an array
  const filters = Array.isArray(selectedFilters) ? selectedFilters : [];

  const filteredFields = mockFields.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         field.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filters.length === 0 || filters.includes(field.type);
    return matchesSearch && matchesType;
  });

  if (showMap) {
    return <FieldMapScreen onBack={() => setShowMap(false)} />;
  }

  if (showTeamSearch) {
    return (
      <TeamSearchScreen
        onBack={() => setShowTeamSearch(false)}
        onJoinTeam={onJoinTeam}
      />
    );
  }

  if (showFullVasoSearch) {
    return (
      <FullVasoSearchScreen
        onFieldClick={(fieldId) => {
          setShowFullVasoSearch(false);
          onFieldClick?.(fieldId);
        }}
        onBack={() => setShowFullVasoSearch(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">Buscar</h1>
          
          {hasReservation && (
            <button
              onClick={onCartClick}
              className={`relative p-2 hover:bg-muted rounded-full transition-colors ${
                cart.isPending ? 'animate-pulse' : ''
              }`}
            >
              <ShoppingCart size={24} className={cart.isPending ? 'text-red-500' : 'text-[#047857]'} />
              {(totalItems > 0 || cart.isPending) && (
                <Badge className={`absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs ${
                  cart.isPending ? 'bg-red-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {cart.isPending ? '!' : totalItems}
                </Badge>
              )}
            </button>
          )}
        </div>

        {/* Barra de Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Buscar canchas por nombre o ubicación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-input-background"
          />
        </div>

        {/* Chips de Filtros */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtros</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <Badge 
              variant="outline" 
              className="px-4 py-2 rounded-full whitespace-nowrap cursor-pointer hover:bg-muted"
              onClick={() => setShowMap(true)}
            >
              <MapPin size={14} className="mr-1" />
              Mapa
            </Badge>

            <Badge 
              variant="outline" 
              className="px-4 py-2 rounded-full whitespace-nowrap cursor-pointer hover:bg-muted"
              onClick={() => setShowTeamSearch(true)}
            >
              <Users size={14} className="mr-1" />
              Buscar equipo/rival
            </Badge>
          </div>
        </div>

        {/* Active Filters */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Badge 
                key={filter}
                className="bg-[#047857] hover:bg-[#047857]/90 text-white px-3 py-1 cursor-pointer"
                onClick={() => setSelectedFilters(filters.filter(f => f !== filter))}
              >
                {filter} ✕
              </Badge>
            ))}
          </div>
        )}

        {/* Tabs de Contenido */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="canchas">Canchas</TabsTrigger>
            <TabsTrigger value="fullvaso">
              <Wine size={16} className="mr-2" />
              Full Vaso ({mockFields.filter(f => f.hasFullVaso).length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Canchas */}
          <TabsContent value="canchas" className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3>Resultados ({filteredFields.length})</h3>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-[#047857] hover:underline"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>

            {filteredFields.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-2">No se encontraron canchas</p>
                <p className="text-sm text-muted-foreground">Intenta con otros términos de búsqueda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFields.map((field) => (
                  <div
                    key={field.id}
                    onClick={() => onFieldClick?.(field.id)}
                    className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48">
                      <ImageWithFallback
                        src={field.image}
                        alt={field.name}
                        className="w-full h-full object-cover"
                      />
                      {field.available > 0 ? (
                        <Badge className="absolute top-3 right-3 bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                          Libre {field.available}/{field.total}
                        </Badge>
                      ) : (
                        <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-500/90 text-white border-none">
                          Ocupado
                        </Badge>
                      )}
                      <Badge className="absolute top-3 left-3 bg-white/90 text-foreground border-none">
                        {field.type}
                      </Badge>
                      {field.hasFullVaso && (
                        <Badge className="absolute bottom-3 left-3 bg-purple-600 hover:bg-purple-600/90 text-white border-none">
                          <Wine size={14} className="mr-1" />
                          Full Vaso
                        </Badge>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="mb-2">{field.name}</h3>
                      <div className="flex items-center text-muted-foreground text-sm mb-2">
                        <MapPin size={14} className="mr-1" />
                        {field.location}
                      </div>
                      <p className="text-[#047857]">S/ {field.price}.00 la hora</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Full Vaso */}
          <TabsContent value="fullvaso" className="space-y-4 mt-4">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-4 text-white mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Wine size={24} />
                <h3 className="text-white">Promociones Full Vaso</h3>
              </div>
              <p className="text-sm text-white/90">
                Canchas con promociones especiales en bebidas y snacks
              </p>
            </div>

            <div className="space-y-4">
              {mockFields.filter(f => f.hasFullVaso).map((field) => (
                <div
                  key={field.id}
                  className="bg-white rounded-2xl overflow-hidden border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Promoción destacada */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Wine size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white/80 mb-1">Promoción Full Vaso</p>
                        <p className="text-white">{field.fullVasoPromo}</p>
                      </div>
                    </div>
                  </div>

                  {/* Info de cancha */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3>{field.name}</h3>
                      <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                        Libre {field.available}/{field.total}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{field.location}</span>
                      </div>
                      <Badge variant="outline">{field.type}</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xl text-[#047857]">S/ {field.price}.00/hora</p>
                      <button
                        onClick={() => onFieldClick?.(field.id)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        Ver Cancha
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
