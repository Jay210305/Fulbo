import { Plus, Loader2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { ProductStats } from "./ProductStats";
import { ProductCard } from "./ProductCard";
import type { Product } from "../types";

interface ProductListProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onAddClick: () => void;
  onToggleActive: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export function ProductList({
  products,
  loading,
  error,
  onRetry,
  onAddClick,
  onToggleActive,
  onEdit,
  onDelete
}: ProductListProps) {
  const activeProducts = products.filter(p => p.isActive);
  const inactiveProducts = products.filter(p => !p.isActive);

  return (
    <>
      {/* Stats */}
      <ProductStats
        total={products.length}
        active={activeProducts.length}
        inactive={inactiveProducts.length}
      />

      {/* Add Product Button */}
      <Button
        className="w-full bg-[#047857] hover:bg-[#047857]/90"
        onClick={onAddClick}
      >
        <Plus size={16} className="mr-2" />
        Añadir Producto
      </Button>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-[#047857]" size={32} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
          {error}
          <Button variant="outline" size="sm" className="ml-2" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay productos registrados</p>
          <p className="text-sm">Añade tu primer producto al menú</p>
        </div>
      )}

      {/* Products List */}
      {!loading && !error && products.length > 0 && (
        <div>
          <h3 className="mb-4">Productos del Menú</h3>
          <div className="space-y-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleActive={onToggleActive}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
