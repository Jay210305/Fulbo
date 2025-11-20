import { useState } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, Wine, Coffee, Utensils, Dumbbell } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface ProductManagementProps {
  fieldName: string;
  onBack: () => void;
}

const categoryIcons: Record<string, any> = {
  bebida: Wine,
  snack: Utensils,
  equipo: Dumbbell,
  promocion: Coffee
};

const mockProducts = [
  {
    id: '1',
    name: 'Gatorade 500ml',
    description: 'Bebida rehidratante, varios sabores',
    price: 5.00,
    category: 'bebida',
    image: 'https://images.unsplash.com/photo-1629385982145-8c5f9fd7da27?w=400',
    active: true
  },
  {
    id: '2',
    name: 'Full Vaso Premium',
    description: '2x1 en cervezas + Piqueo gratis',
    price: 25.00,
    category: 'promocion',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
    active: true
  }
];

export function ProductManagement({ fieldName, onBack }: ProductManagementProps) {
  const [products, setProducts] = useState(mockProducts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'bebida',
    image: ''
  });

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price) {
      setProducts([...products, {
        id: Date.now().toString(),
        ...newProduct,
        price: parseFloat(newProduct.price),
        active: true
      }]);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: 'bebida',
        image: ''
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2>Catálogo de Productos</h2>
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
            <p className="text-xl text-[#047857] mb-1">
              {products.filter(p => p.category === 'promocion').length}
            </p>
            <p className="text-xs text-muted-foreground">Promociones</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xl text-[#047857] mb-1">
              {products.filter(p => p.active).length}
            </p>
            <p className="text-xs text-muted-foreground">Activos</p>
          </div>
        </div>

        {/* Add Button */}
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full bg-[#047857] hover:bg-[#047857]/90"
        >
          <Plus size={16} className="mr-2" />
          Agregar Producto
        </Button>

        {/* Add Form */}
        {showAddForm && (
          <div className="border-2 border-[#047857] rounded-xl p-4 space-y-4">
            <h3>Nuevo Producto</h3>
            
            <div>
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Ej: Gatorade 500ml"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Describe el producto..."
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="price">Precio (S/) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.50"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bebida">Bebida</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                    <SelectItem value="equipo">Equipo</SelectItem>
                    <SelectItem value="promocion">Promoción</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="image">URL de Imagen</Label>
              <Input
                id="image"
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddProduct} className="flex-1 bg-[#047857] hover:bg-[#047857]/90">
                Guardar Producto
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Products List */}
        <div>
          <h3 className="mb-3">Productos Disponibles</h3>
          <div className="space-y-3">
            {products.map((product) => {
              const Icon = categoryIcons[product.category];
              return (
                <div key={product.id} className="border border-border rounded-xl p-4">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {product.image ? (
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon size={24} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="mb-1">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        </div>
                        {product.active ? (
                          <Badge className="bg-[#34d399] text-white">Activo</Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            <Icon size={12} className="mr-1" />
                            {product.category}
                          </Badge>
                          <p className="text-[#047857]">S/ {product.price.toFixed(2)}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit2 size={14} />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
