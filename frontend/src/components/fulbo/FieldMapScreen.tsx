import { MapPin, Star, ArrowLeft } from "lucide-react";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface FieldMapScreenProps {
  onBack: () => void;
}

const nearbyFields = [
  {
    id: '1',
    name: 'Canchita La Merced',
    location: 'Tahuaycani',
    distance: '0.8 km',
    image: 'https://images.unsplash.com/photo-1641029185333-7ed62a19d5f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBmaWVsZCUyMGFlcmlhbHxlbnwxfHx8fDE3NTk5ODI2MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    available: 2,
    total: 10,
    price: 35,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Estadio Zona Sur',
    location: 'Santa Bárbara',
    distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1680537732560-7dd5f9b1ed53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvb3IlMjBzb2NjZXIlMjBjb3VydHxlbnwxfHx8fDE3NTk5NjA3NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    available: 5,
    total: 10,
    price: 45,
    rating: 4.9
  },
  {
    id: '3',
    name: 'Cancha Los Pinos',
    location: 'Centro',
    distance: '1.5 km',
    image: 'https://images.unsplash.com/photo-1663380821666-aa8aa44fc445?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMGZpZWxkJTIwZ3Jhc3N8ZW58MXx8fHwxNzYwMDQ1OTIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    available: 0,
    total: 10,
    price: 40,
    rating: 4.7
  },
  {
    id: '4',
    name: 'Complejo Norte',
    location: 'Tahuaycani',
    distance: '2.1 km',
    image: 'https://images.unsplash.com/photo-1641029185333-7ed62a19d5f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBmaWVsZCUyMGFlcmlhbHxlbnwxfHx8fDE3NTk5ODI2MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    available: 3,
    total: 10,
    price: 50,
    rating: 4.6
  }
];

const mapPins = [
  { id: 1, top: '25%', left: '30%', name: 'Canchita La Merced' },
  { id: 2, top: '40%', left: '55%', name: 'Estadio Zona Sur' },
  { id: 3, top: '60%', left: '40%', name: 'Cancha Los Pinos' },
  { id: 4, top: '35%', left: '70%', name: 'Complejo Norte' },
  { id: 5, top: '70%', left: '25%', name: 'Cancha Express' },
  { id: 6, top: '50%', left: '80%', name: 'Deportivo Central' }
];

export function FieldMapScreen({ onBack }: FieldMapScreenProps) {
  return (
    <div className="min-h-screen bg-white pb-20 flex flex-col">
      {/* Header con botón de retroceso */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-20">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>Mapa de Canchas</h2>
      </div>

      {/* Map View */}
      <div className="relative h-[55vh] bg-gradient-to-br from-green-50 via-blue-50 to-green-50 overflow-hidden">
        {/* Simulated map background pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg, 
              #e0e0e0 0px, 
              #e0e0e0 1px, 
              transparent 1px, 
              transparent 40px
            ),
            repeating-linear-gradient(
              90deg, 
              #e0e0e0 0px, 
              #e0e0e0 1px, 
              transparent 1px, 
              transparent 40px
            )`
          }}
        />
        
        {/* Map pins */}
        {mapPins.map((pin) => (
          <div
            key={pin.id}
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer group"
            style={{ top: pin.top, left: pin.left }}
          >
            <MapPin
              size={40}
              className="text-[#047857] drop-shadow-lg"
              fill="#047857"
            />
            <Badge className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white text-foreground border border-border">
              {pin.name}
            </Badge>
          </div>
        ))}
        
        {/* Current location indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
        </div>
      </div>

      {/* Nearby Fields List */}
      <div className="flex-1 bg-white">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3>Canchas Cercanas</h3>
            <p className="text-sm text-muted-foreground">{nearbyFields.length} canchas</p>
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-[calc(45vh-80px)]">
            {nearbyFields.map((field) => (
              <div
                key={field.id}
                className="bg-white border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex gap-3 p-3">
                  {/* Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={field.image}
                      alt={field.name}
                      className="w-full h-full object-cover"
                    />
                    {field.available > 0 ? (
                      <Badge className="absolute top-1 right-1 bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none text-xs px-1.5 py-0.5">
                        Libre
                      </Badge>
                    ) : (
                      <Badge className="absolute top-1 right-1 bg-red-500 hover:bg-red-500/90 text-white border-none text-xs px-1.5 py-0.5">
                        Ocupado
                      </Badge>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="truncate">{field.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span className="text-xs">{field.location}</span>
                          </div>
                          <span className="text-xs">•</span>
                          <span className="text-xs">{field.distance}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm">{field.rating}</span>
                      </div>
                      <p className="text-[#047857]">S/ {field.price}/h</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
