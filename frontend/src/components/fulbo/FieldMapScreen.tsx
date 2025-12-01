import { useState, useEffect } from "react";
import { MapPin, Star, ArrowLeft, Loader2 } from "lucide-react"; // Agregué Loader2 para carga
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface FieldMapScreenProps {
  onBack: () => void;
}

// Definimos la interfaz para el tipo de dato que manejamos
interface FieldMapData {
  id: string;
  name: string;
  location: string;
  distance: string;
  image: string;
  available: number;
  total: number;
  price: number;
  rating: number;
}

export function FieldMapScreen({ onBack }: FieldMapScreenProps) {
  // 1. Estado inicial vacío, no mocks
  const [fields, setFields] = useState<FieldMapData[]>([]);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocalización no soportada por tu navegador");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // 2. Llamada al Backend Real
        fetch(
          `http://localhost:3000/api/fields?lat=${latitude}&lng=${longitude}`
        )
          .then((res) => {
            if (!res.ok) throw new Error("Error al conectar con el servidor");
            return res.json();
          })
          .then((data) => {
            console.log("Canchas cercanas encontradas:", data);

            // Mapeamos los datos del backend.
            // NOTA: Mantenemos los randoms para 'available' y 'rating' porque
            // el backend aún no calcula esa lógica compleja, pero la DATA BASE (nombre, precio, ubicación) es real.
            interface ApiField {
              id: string;
              name: string;
              location: string;
              distance?: string;
              image: string;
              price: number;
            }
            const mappedFields = data.map((field: ApiField) => ({
              id: field.id, // Asegúrate que el backend devuelva 'id' o mapea 'field_id'
              name: field.name,
              location: field.location, // El backend ya devuelve la dirección aquí
              distance: field.distance || "0.5 km", // El backend devuelve esto calculado
              image: field.image,
              available: Math.floor(Math.random() * 5) + 1, // Simulación visual
              total: 10,
              price: field.price,
              rating: 4.5 + Math.random() * 0.5, // Simulación visual
            }));

            setFields(mappedFields);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error:", err);
            setError("No se pudieron cargar las canchas cercanas");
            setLoading(false);
          });
      },
      (err) => {
        console.error("Error de geolocalización:", err);
        setError("Permiso de ubicación denegado o no disponible");
        setLoading(false);
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-white pb-20 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-20">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>Mapa de Canchas</h2>
      </div>

      {/* Map View */}
      <div className="relative h-[55vh] bg-gradient-to-br from-green-50 via-blue-50 to-green-50 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #e0e0e0 0px, #e0e0e0 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #e0e0e0 0px, #e0e0e0 1px, transparent 1px, transparent 40px)`,
          }}
        />

        {/* Pines en el mapa (Simulados visualmente por ahora, ya que no tenemos mapa real interactivo como Google Maps) */}
        {/* En una implementación real, aquí iría el componente <GoogleMap> con <Marker> usando las coordenadas de 'fields' */}
        {fields.slice(0, 5).map((field, index) => (
          <div
            key={field.id}
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer group"
            // Posicionamiento aleatorio simulado para el prototipo visual sin mapa real
            style={{ 
                top: `${30 + (index * 10)}%`, 
                left: `${20 + (index * 15)}%` 
            }}
          >
            <MapPin
              size={40}
              className="text-[#047857] drop-shadow-lg"
              fill="#047857"
            />
            <Badge className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white text-foreground border border-border">
              {field.name}
            </Badge>
          </div>
        ))}

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
        </div>
      </div>

      {/* Nearby Fields List */}
      <div className="flex-1 bg-white">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3>Canchas Cercanas</h3>
            <p className="text-sm text-muted-foreground">
              {loading ? "Buscando..." : `${fields.length} canchas`}
            </p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[calc(45vh-80px)]">
            {loading && (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-[#047857]" />
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-500 text-sm">
                {error}
              </div>
            )}

            {!loading && !error && fields.length === 0 && (
               <div className="text-center py-8 text-muted-foreground">
                  No se encontraron canchas en tu zona (5km).
               </div>
            )}

            {fields.map((field) => (
              <div
                key={field.id}
                className="bg-white border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex gap-3 p-3">
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={field.image}
                      alt={field.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className={`absolute top-1 right-1 border-none text-xs px-1.5 py-0.5 text-white ${field.available > 0 ? 'bg-[#34d399]' : 'bg-red-500'}`}>
                      {field.available > 0 ? 'Libre' : 'Ocupado'}
                    </Badge>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="truncate">{field.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span className="text-xs truncate max-w-[100px]">{field.location}</span>
                          </div>
                          <span className="text-xs">•</span>
                          <span className="text-xs">{field.distance}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Star
                          size={14}
                          className="text-yellow-500 fill-yellow-500"
                        />
                        <span className="text-sm">{field.rating.toFixed(1)}</span>
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