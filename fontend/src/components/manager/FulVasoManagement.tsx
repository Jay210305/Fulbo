import { useState } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, X, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface FulVasoManagementProps {
  fieldName: string;
  onBack: () => void;
}

const products = [
  { id: 1, name: 'Gatorade', description: 'Bebida isotónica 500ml', price: 5, image: 'https://images.unsplash.com/photo-1629385982145-8c5f9fd7da27?w=400' },
  { id: 2, name: 'Agua Mineral', description: 'Agua San Luis 625ml', price: 3, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400' },
  { id: 3, name: 'Powerade', description: 'Bebida deportiva 500ml', price: 5, image: 'https://images.unsplash.com/photo-1629385982145-8c5f9fd7da27?w=400' },
  { id: 4, name: 'Coca Cola', description: 'Gaseosa 500ml', price: 4, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400' }
];

export function FulVasoManagement({ fieldName, onBack }: FulVasoManagementProps) {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image: ''
  });

  const handleAddProduct = () => {
    // Simular agregar producto
    console.log('Producto agregado:', newProduct);
    setShowAddProduct(false);
    setNewProduct({ name: '', description: '', price: '', image: '' });
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2>Menú FulVaso</h2>
          <p className="text-sm text-muted-foreground">{fieldName}</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xl text-[#047857] mb-1">{products.length}</p>
            <p className="text-xs text-muted-foreground">Productos</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xl text-[#047857] mb-1">S/ 142</p>
            <p className="text-xs text-muted-foreground">Ventas Hoy</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xl text-[#047857] mb-1">24</p>
            <p className="text-xs text-muted-foreground">Pedidos</p>
          </div>
        </div>

        {/* Add Product Button */}
        <Button
          className="w-full bg-[#047857] hover:bg-[#047857]/90"
          onClick={() => setShowAddProduct(true)}
        >
          <Plus size={16} className="mr-2" />
          Añadir Producto
        </Button>

        {/* Products List */}
        <div>
          <h3 className="mb-4">Productos del Menú</h3>
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-border rounded-xl p-4 flex gap-3"
              >
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="mb-1">{product.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                  <p className="text-[#047857]">S/ {product.price}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <button className="p-2 hover:bg-secondary rounded-lg">
                    <Edit2 size={16} className="text-[#047857]" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <h2>Añadir Producto</h2>
              <button onClick={() => setShowAddProduct(false)} className="p-2 hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="productName">Nombre del Producto</Label>
                <Input
                  id="productName"
                  placeholder="Ej: Gatorade"
                  className="h-12"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="productDescription">Descripción</Label>
                <Textarea
                  id="productDescription"
                  placeholder="Ej: Bebida isotónica 500ml"
                  className="min-h-20"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="productPrice">Precio (S/)</Label>
                <Input
                  id="productPrice"
                  type="number"
                  placeholder="5.00"
                  className="h-12"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="productImage">Imagen del Producto</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-[#047857] transition-colors">
                  <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Haz clic para subir una imagen</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG hasta 5MB</p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddProduct(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#047857] hover:bg-[#047857]/90"
                onClick={handleAddProduct}
              >
                Agregar Producto
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
