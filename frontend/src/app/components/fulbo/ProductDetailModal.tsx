import { useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface ProductDetailModalProps {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    description?: string;
  };
  onClose: () => void;
  onAddToCart: (productId: number, quantity: number) => void;
}

export function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(product.id, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
          <h2>Detalle del Producto</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Product Image */}
          <div className="w-full h-64 rounded-xl overflow-hidden bg-muted">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div>
            <h3 className="mb-2">{product.name}</h3>
            <p className="text-2xl text-[#047857] mb-3">S/ {product.price.toFixed(2)}</p>
            <p className="text-muted-foreground">
              {product.description || `Deliciosa bebida ${product.name} para refrescarte durante o después de tu partido.`}
            </p>
          </div>

          {/* Quantity Selector */}
          <div>
            <h4 className="mb-3">Cantidad</h4>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center hover:bg-muted disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus size={20} />
              </button>
              <span className="text-2xl w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-full bg-[#047857] text-white flex items-center justify-center hover:bg-[#047857]/90"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="bg-secondary rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span>Subtotal:</span>
              <span className="text-xl text-[#047857]">S/ {(product.price * quantity).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border p-4">
          <Button
            onClick={handleAddToCart}
            className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
          >
            Agregar al Carrito
          </Button>
        </div>
      </div>
    </div>
  );
}
