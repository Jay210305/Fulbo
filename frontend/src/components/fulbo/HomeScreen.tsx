import { MapPin, Wine, ShoppingCart } from "lucide-react";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { PromotionsCarousel } from "../shared/PromotionsCarousel";

import { useCart } from "../../contexts/CartContext";
import { useState, useEffect } from "react";

interface HomeScreenProps {
  onFieldClick: (fieldId: string) => void;
  onCartClick?: () => void;
}

interface FieldData {
  id: string;
  name: string;
  location: string;
  image: string;
  available: number;
  total: number;
  price: number;
  type: string;
  rating: number;
  hasFullVaso?: boolean;
}

export function HomeScreen({ onFieldClick, onCartClick }: HomeScreenProps) {
  const { getTotalItems, cart } = useCart();
  const totalItems = getTotalItems();
  const hasReservation = cart.field && cart.selectedTime;

  // ESTADO PARA CANCHAS REALES
  const [fields, setFields] = useState<FieldData[]>([]);
  const [loading, setLoading] = useState(true);

  // EFECTO PARA CARGAR DATOS DEL BACKEND
  useEffect(() => {
    fetch("http://localhost:4000/api/fields")
      .then((res) => res.json())
      .then((data) => {
        setFields(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando canchas:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl text-[#289B5F]">Fulbo</h1>

          {hasReservation && (
            <button
              onClick={onCartClick}
              className={`relative p-2 hover:bg-muted rounded-full transition-colors ${
                cart.isPending ? "animate-pulse" : ""
              }`}
            >
              <ShoppingCart
                size={24}
                className={cart.isPending ? "text-red-500" : "text-[#289B5F]"}
              />
              {(totalItems > 0 || cart.isPending) && (
                <Badge
                  className={`absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs ${
                    cart.isPending
                      ? "bg-red-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {cart.isPending ? "!" : totalItems}
                </Badge>
              )}
            </button>
          )}
        </div>

        <div>
          <PromotionsCarousel />
        </div>

        <div>
          <h3 className="mb-3">Canchas Disponibles</h3>
          {loading ? (
            <div className="p-4 text-center">Cargando canchas...</div>
          ) : (
            <div className="space-y-4">
              {fields.map((field) => (
                <div
                  key={field.id}
                  onClick={() => onFieldClick(field.id)}
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
                    {field.hasFullVaso && (
                      <Badge className="absolute top-3 left-3 bg-purple-600 hover:bg-purple-600/90 text-white border-none">
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
                    <p className="text-[#289B5F]">
                      S/ {field.price}.00 la hora
                    </p>
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
