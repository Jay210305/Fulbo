import { Wine, MapPin, Star, ArrowLeft } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { mockFields } from "../../types/field";

interface FullVasoSearchScreenProps {
  onFieldClick: (fieldId: string) => void;
  onBack: () => void;
}

export function FullVasoSearchScreen({ onFieldClick, onBack }: FullVasoSearchScreenProps) {
  const fullVasoFields = mockFields.filter(field => field.hasFullVaso);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Wine size={20} className="text-purple-600" />
          <h2>Canchas con Full Vaso</h2>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Wine size={24} />
            <h3 className="text-white">Promociones Full Vaso</h3>
          </div>
          <p className="text-sm text-white/90">
            Encuentra canchas con promociones especiales en bebidas y snacks. 
            Reserva tu cancha y disfruta de ofertas exclusivas.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3>{fullVasoFields.length} Canchas Disponibles</h3>
          </div>

          {fullVasoFields.length === 0 ? (
            <div className="text-center py-16">
              <Wine size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="mb-2">No hay promociones disponibles</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Vuelve más tarde para ver nuevas ofertas de Full Vaso
              </p>
              <Button onClick={onBack} variant="outline">
                Volver a Buscar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {fullVasoFields.map((field) => (
                <div
                  key={field.id}
                  className="bg-white rounded-2xl overflow-hidden border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Promoción destacada arriba */}
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

                  {/* Información de la cancha */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3>{field.name}</h3>
                      <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                        Libre {field.available}/{field.total}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{field.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} fill="#facc15" className="text-[#facc15]" />
                        <span>{field.rating}</span>
                      </div>
                      <Badge variant="outline">{field.type}</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Precio por hora</p>
                        <p className="text-xl text-[#047857]">S/ {field.price}.00</p>
                      </div>
                      <Button
                        onClick={() => onFieldClick(field.id)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Ver Cancha
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
