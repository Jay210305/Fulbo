import { Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { ImageWithFallback } from "../../../../components/figma/ImageWithFallback";
import type { Product } from "../types";
import { CATEGORY_LABELS } from "../types";

interface ProductCardProps {
  product: Product;
  onToggleActive: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export function ProductCard({ product, onToggleActive, onEdit, onDelete }: ProductCardProps) {
  return (
    <div
      className={`bg-white border rounded-xl p-4 flex gap-3 ${!product.isActive ? 'opacity-60 border-gray-300' : 'border-border'}`}
    >
      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        <ImageWithFallback
          src={product.image || ''}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4>{product.name}</h4>
          <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
            {CATEGORY_LABELS[product.category]}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
        <p className="text-[#047857]">S/ {product.price.toFixed(2)}</p>
        {!product.isActive && (
          <span className="text-xs text-red-500">Inactivo</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button
          className="p-2 hover:bg-secondary rounded-lg"
          onClick={() => onToggleActive(product)}
          title={product.isActive ? 'Desactivar' : 'Activar'}
        >
          {product.isActive ? (
            <ToggleRight size={16} className="text-[#047857]" />
          ) : (
            <ToggleLeft size={16} className="text-gray-400" />
          )}
        </button>
        <button
          className="p-2 hover:bg-secondary rounded-lg"
          onClick={() => onEdit(product)}
        >
          <Edit2 size={16} className="text-[#047857]" />
        </button>
        <button
          className="p-2 hover:bg-red-50 rounded-lg"
          onClick={() => onDelete(product.id)}
        >
          <Trash2 size={16} className="text-red-500" />
        </button>
      </div>
    </div>
  );
}
