import { useState, useEffect } from "react";
import {
  MapPin,
  Users,
  ShoppingBag,
  ShoppingCart,
  Loader2,
  Star,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { PromotionsCarousel } from "../shared/PromotionsCarousel";
import { FieldTypeFilter } from "./FieldTypeFilter";
import { ProductDetailModal } from "./ProductDetailModal";
import { FulVasoCart } from "./FulVasoCart";

interface FieldListScreenProps {
  onFieldClick: (fieldId: string) => void;
  onShowLocationFilter?: () => void;
  onShowTeamSearch?: () => void;
}

// Mantenemos los productos FulVaso locales por ahora (Fase siguiente)
const fulVasoProducts = [
  {
    id: 1,
    name: "Gatorade",
    price: 5,
    image: "https://images.unsplash.com/photo-1629385982145-8c5f9fd7da27?w=400",
  },
  {
    id: 2,
    name: "Agua Mineral",
    price: 3,
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
  },
  {
    id: 3,
    name: "Powerade",
    price: 5,
    image: "https://images.unsplash.com/photo-1629385982145-8c5f9fd7da27?w=400",
  },
  {
    id: 4,
    name: "Coca Cola",
    price: 4,
    image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
  },
];

// Definimos la interfaz para los datos reales
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

export function FieldListScreen({
  onFieldClick,
  onShowLocationFilter,
  onShowTeamSearch,
}: FieldListScreenProps) {
  const [showFieldTypeFilter, setShowFieldTypeFilter] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof fulVasoProducts)[0] | null
  >(null);
  const [showCart, setShowCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // ESTADOS PARA DATOS REALES
  const [fields, setFields] = useState<FieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CARGAR CANCHAS DEL BACKEND
  useEffect(() => {
    fetch("http://localhost:4000/api/fields")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar canchas");
        return res.json();
      })
      .then((data) => {
        // Mapeamos para asegurar que la UI reciba lo que espera
        interface ApiField {
          id: string;
          name: string;
          location: string;
          price: number;
          image: string;
          type?: string;
        }
        const mappedFields = data.map((f: ApiField) => ({
          id: f.id, // Este es el UUID real
          name: f.name,
          location: f.location,
          price: f.price,
          image: f.image,
          type: f.type || "Fútbol 7",
          // Simulamos estos datos visuales si el backend aun no los manda
          rating: 4.8,
          available: 5,
          total: 10,
          hasFullVaso: false,
        }));
        setFields(mappedFields);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar las canchas");
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (productId: number, quantity: number) => {
    setCartCount((prev) => prev + quantity);
  };

  if (showCart) {
    return (
      <FulVasoCart
        onBack={() => setShowCart(false)}
        onCheckout={() => setShowCart(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 space-y-5">
        <div>
          <h1 className="text-2xl mb-4">Canchas</h1>

          {/* Filtros (Chips) - Sin cambios */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
            <Badge
              variant="outline"
              className="px-4 py-2 rounded-full whitespace-nowrap cursor-pointer hover:bg-muted"
              onClick={onShowLocationFilter}
            >
              <MapPin size={14} className="mr-1" />
              Mapa
            </Badge>
            <Badge
              variant="outline"
              className="px-4 py-2 rounded-full whitespace-nowrap cursor-pointer hover:bg-muted"
              onClick={() => setShowFieldTypeFilter(true)}
            >
              Tipo de cancha
            </Badge>
            <Badge
              variant="outline"
              className="px-4 py-2 rounded-full whitespace-nowrap cursor-pointer hover:bg-muted"
              onClick={onShowTeamSearch}
            >
              <Users size={14} className="mr-1" />
              Buscar equipo/rival
            </Badge>
          </div>

          <PromotionsCarousel />
        </div>

        {showFieldTypeFilter && (
          <FieldTypeFilter
            onClose={() => setShowFieldTypeFilter(false)}
            onApply={(filters) => {
              console.log("Applied filters:", filters);
            }}
          />
        )}

        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Sección FulVaso - Sin cambios */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#047857]" />
              <h3>FulVaso - Bebidas y Snacks</h3>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 hover:bg-muted rounded-full"
            >
              <ShoppingCart size={20} className="text-[#047857]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#047857] text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {fulVasoProducts.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-32">
                <div
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="w-full h-24 bg-muted flex items-center justify-center">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-sm mb-1">{product.name}</p>
                    <p className="text-sm text-[#047857]">S/ {product.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LISTA DE CANCHAS REALES */}
        <div>
          <h3 className="mb-3">Canchas Disponibles</h3>

          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-[#047857]" />
            </div>
          )}

          {!loading && !error && fields.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay canchas disponibles.
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field) => (
              <div
                key={field.id}
                onClick={() => onFieldClick(field.id)} // ¡Aquí pasamos el UUID real!
                className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="relative h-48">
                  <ImageWithFallback
                    src={field.image}
                    alt={field.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 right-3 bg-[#34d399] text-white border-none">
                    Libre {field.available}/{field.total}
                  </Badge>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="mb-1 font-semibold">{field.name}</h3>
                      <div className="flex items-center text-muted-foreground text-sm mb-2">
                        <MapPin size={14} className="mr-1" />
                        {field.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
                      <Star
                        size={14}
                        className="text-yellow-500 fill-yellow-500"
                      />
                      <span className="text-xs font-medium text-[#047857]">
                        {field.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-[#047857] font-medium">
                    S/ {field.price.toFixed(2)} la hora
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
