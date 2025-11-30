import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, X, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ProductApi, Product, ProductCategory, CreateProductDto, UpdateProductDto } from "../../services/api";

interface FulVasoManagementProps {
  fieldId: string;
  fieldName: string;
  onBack: () => void;
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  bebida: 'Bebida',
  snack: 'Snack',
  equipo: 'Equipo',
  promocion: 'Promoción'
};

export function FulVasoManagement({ fieldId, fieldName, onBack }: FulVasoManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'bebida' as ProductCategory
  });

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fieldId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductApi.getByField(fieldId);
      setProducts(data);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Nombre y precio son obligatorios');
      return;
    }

    try {
      setSaving(true);
      const productData: CreateProductDto = {
        name: newProduct.name,
        description: newProduct.description || undefined,
        price: parseFloat(newProduct.price),
        imageUrl: newProduct.imageUrl || undefined,
        category: newProduct.category
      };

      const response = await ProductApi.create(fieldId, productData);
      setProducts([response.product, ...products]);
      setShowAddProduct(false);
      resetForm();
    } catch (err) {
      console.error('Error creating product:', err);
      alert('Error al crear el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !newProduct.name || !newProduct.price) {
      alert('Nombre y precio son obligatorios');
      return;
    }

    try {
      setSaving(true);
      const productData: UpdateProductDto = {
        name: newProduct.name,
        description: newProduct.description || undefined,
        price: parseFloat(newProduct.price),
        imageUrl: newProduct.imageUrl || undefined,
        category: newProduct.category
      };

      const response = await ProductApi.update(editingProduct.id, productData);
      setProducts(products.map(p => p.id === editingProduct.id ? response.product : p));
      setEditingProduct(null);
      resetForm();
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Error al actualizar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await ProductApi.delete(productId);
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error al eliminar el producto');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const response = await ProductApi.toggleActive(product.id, !product.isActive);
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, isActive: response.product.isActive } : p
      ));
    } catch (err) {
      console.error('Error toggling product status:', err);
      alert('Error al cambiar el estado del producto');
    }
  };

  const resetForm = () => {
    setNewProduct({ name: '', description: '', price: '', imageUrl: '', category: 'bebida' });
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      imageUrl: product.image || '',
      category: product.category
    });
  };

  const closeModal = () => {
    setShowAddProduct(false);
    setEditingProduct(null);
    resetForm();
  };

  const activeProducts = products.filter(p => p.isActive);

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
            <p className="text-xl text-[#047857] mb-1">{activeProducts.length}</p>
            <p className="text-xs text-muted-foreground">Activos</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xl text-[#047857] mb-1">{products.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xl text-[#047857] mb-1">{products.filter(p => !p.isActive).length}</p>
            <p className="text-xs text-muted-foreground">Inactivos</p>
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
            <Button variant="outline" size="sm" className="ml-2" onClick={fetchProducts}>
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
                <div
                  key={product.id}
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
                      onClick={() => handleToggleActive(product)}
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
                      onClick={() => openEditModal(product)}
                    >
                      <Edit2 size={16} className="text-[#047857]" />
                    </button>
                    <button 
                      className="p-2 hover:bg-red-50 rounded-lg"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddProduct || editingProduct) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <h2>{editingProduct ? 'Editar Producto' : 'Añadir Producto'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="productName">Nombre del Producto *</Label>
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
                <Label htmlFor="productCategory">Categoría *</Label>
                <select
                  id="productCategory"
                  className="w-full h-12 px-3 border border-input rounded-md bg-background"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as ProductCategory })}
                >
                  <option value="bebida">Bebida</option>
                  <option value="snack">Snack</option>
                  <option value="equipo">Equipo</option>
                  <option value="promocion">Promoción</option>
                </select>
              </div>

              <div>
                <Label htmlFor="productPrice">Precio (S/) *</Label>
                <Input
                  id="productPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="5.00"
                  className="h-12"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="productImageUrl">URL de Imagen</Label>
                <Input
                  id="productImageUrl"
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="h-12"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                />
                {newProduct.imageUrl && (
                  <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                    <ImageWithFallback
                      src={newProduct.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={closeModal}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#047857] hover:bg-[#047857]/90"
                onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : null}
                {editingProduct ? 'Guardar Cambios' : 'Agregar Producto'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
