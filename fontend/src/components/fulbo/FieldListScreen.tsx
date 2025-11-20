import { useState } from "react";
import { MapPin, Users, ShoppingBag, ShoppingCart } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
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

const fulVasoProducts = [
  { id: 1, name: 'Gatorade', price: 5, image: 'https://images.unsplash.com/photo-1629385982145-8c5f9fd7da27?w=400' },
  { id: 2, name: 'Agua Mineral', price: 3, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400' },
  { id: 3, name: 'Powerade', price: 5, image: 'https://images.unsplash.com/photo-1629385982145-8c5f9fd7da27?w=400' },
  { id: 4, name: 'Coca Cola', price: 4, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400' }
];

const fields = [
  {
    id: '1',
    name: 'Canchita La Merced',
    location: 'Tahuaycani',
    image: 'https://images.unsplash.com/photo-1641029185333-7ed62a19d5f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBmaWVsZCUyMGFlcmlhbHxlbnwxfHx8fDE3NTk5ODI2MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    available: 2,
    total: 10,
    price: 35
  },
  {
    id: '2',
    name: 'Estadio Zona Sur',
    location: 'Santa Bárbara',
    image: 'https://images.unsplash.com/photo-1680537732560-7dd5f9b1ed53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvb3IlMjBzb2NjZXIlMjBjb3VydHxlbnwxfHx8fDE3NTk5NjA3NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    available: 5,
    total: 10,
    price: 45
  },
  {
    id: '3',
    name: 'Cancha Los Pinos',
    location: 'Centro',
    image: 'https://images.unsplash.com/photo-1663380821666-aa8aa44fc445?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMGZpZWxkJTIwZ3Jhc3N8ZW58MXx8fHwxNzYwMDQ1OTIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    available: 0,
    total: 10,
    price: 40
  },
  {
    id: '4',
    name: 'Complejo Deportivo Norte',
    location: 'Tahuaycani',
    image: 'https://images.unsplash.com/photo-1641029185333-7ed62a19d5f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBmaWVsZCUyMGFlcmlhbHxlbnwxfHx8fDE3NTk5ODI2MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    available: 3,
    total: 10,
    price: 50
  }
];

export function FieldListScreen({ onFieldClick, onShowLocationFilter, onShowTeamSearch }: FieldListScreenProps) {
  const [showFieldTypeFilter, setShowFieldTypeFilter] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof fulVasoProducts[0] | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = (productId: number, quantity: number) => {
    setCartCount(prev => prev + quantity);
  };

  if (showCart) {
    return <FulVasoCart onBack={() => setShowCart(false)} onCheckout={() => setShowCart(false)} />;
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 space-y-5">
        <div>
          <h1 className="text-2xl mb-4">Canchas</h1>
          
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
              console.log('Applied filters:', filters);
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

        <div>
          <h3 className="mb-3">Canchas Disponibles</h3>
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
        </div>
      </div>
    </div>
  );
}
