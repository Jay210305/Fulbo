import { useState } from "react";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface FulVasoCartProps {
  onBack: () => void;
  onCheckout: () => void;
}

export function FulVasoCart({ onBack, onCheckout }: FulVasoCartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, name: 'Gatorade', price: 5, quantity: 2, image: 'https://images.unsplash.com/photo-1629385982145-8c5f9fd7da27?w=400' },
    { id: 2, name: 'Agua Mineral', price: 3, quantity: 1, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400' }
  ]);

  const [deliveryTime, setDeliveryTime] = useState('Al finalizar el partido');

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} className="text-[#047857]" />
          <h2>Mi Pedido FulVaso</h2>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="mb-2">Tu carrito está vacío</h3>
            <p className="text-muted-foreground mb-6">Agrega productos para continuar</p>
            <Button onClick={onBack} variant="outline">
              Ver Productos
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div>
              <h3 className="mb-4">Productos ({cartItems.length})</h3>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-border rounded-xl p-4 flex gap-3"
                  >
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="mb-1">{item.name}</h4>
                      <p className="text-[#047857]">S/ {item.price}</p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-full bg-[#047857] text-white flex items-center justify-center hover:bg-[#047857]/90"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Time */}
            <div>
              <h3 className="mb-3">Momento de Entrega</h3>
              <div className="space-y-2">
                {['Al finalizar el partido', 'Ahora mismo', 'En el medio tiempo'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setDeliveryTime(option)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                      deliveryTime === option
                        ? 'border-[#047857] bg-secondary'
                        : 'border-border hover:border-[#047857]/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-secondary rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Servicio:</span>
                <span>S/ 0.00</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex items-center justify-between">
                <span>Total:</span>
                <span className="text-xl text-[#047857]">S/ {total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 pb-6">
          <Button
            onClick={onCheckout}
            className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
          >
            Confirmar Pedido - S/ {total.toFixed(2)}
          </Button>
        </div>
      )}
    </div>
  );
}
