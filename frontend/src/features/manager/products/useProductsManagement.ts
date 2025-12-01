import { useState, useEffect, useCallback } from "react";
import { ProductApi, Product, CreateProductDto, UpdateProductDto } from "../../../services/api";
import { ProductForm, INITIAL_PRODUCT_FORM } from "./types";

export function useProductsManagement(fieldId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [productForm, setProductForm] = useState<ProductForm>(INITIAL_PRODUCT_FORM);

  // Fetch products on mount
  const fetchProducts = useCallback(async () => {
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
  }, [fieldId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Form actions
  const resetForm = useCallback(() => {
    setProductForm(INITIAL_PRODUCT_FORM);
  }, []);

  const openAddModal = useCallback(() => {
    setShowAddProduct(true);
  }, []);

  const openEditModal = useCallback((product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      imageUrl: product.image || '',
      category: product.category
    });
  }, []);

  const closeModal = useCallback(() => {
    setShowAddProduct(false);
    setEditingProduct(null);
    resetForm();
  }, [resetForm]);

  // CRUD operations
  const handleAddProduct = useCallback(async () => {
    if (!productForm.name || !productForm.price) {
      alert('Nombre y precio son obligatorios');
      return;
    }

    try {
      setSaving(true);
      const productData: CreateProductDto = {
        name: productForm.name,
        description: productForm.description || undefined,
        price: parseFloat(productForm.price),
        imageUrl: productForm.imageUrl || undefined,
        category: productForm.category
      };

      const response = await ProductApi.create(fieldId, productData);
      setProducts(prev => [response.product, ...prev]);
      closeModal();
    } catch (err) {
      console.error('Error creating product:', err);
      alert('Error al crear el producto');
    } finally {
      setSaving(false);
    }
  }, [fieldId, productForm, closeModal]);

  const handleUpdateProduct = useCallback(async () => {
    if (!editingProduct || !productForm.name || !productForm.price) {
      alert('Nombre y precio son obligatorios');
      return;
    }

    try {
      setSaving(true);
      const productData: UpdateProductDto = {
        name: productForm.name,
        description: productForm.description || undefined,
        price: parseFloat(productForm.price),
        imageUrl: productForm.imageUrl || undefined,
        category: productForm.category
      };

      const response = await ProductApi.update(editingProduct.id, productData);
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? response.product : p));
      closeModal();
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Error al actualizar el producto');
    } finally {
      setSaving(false);
    }
  }, [editingProduct, productForm, closeModal]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await ProductApi.delete(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error al eliminar el producto');
    }
  }, []);

  const handleToggleActive = useCallback(async (product: Product) => {
    try {
      const response = await ProductApi.toggleActive(product.id, !product.isActive);
      setProducts(prev => 
        prev.map(p => p.id === product.id ? { ...p, isActive: response.product.isActive } : p)
      );
    } catch (err) {
      console.error('Error toggling product status:', err);
      alert('Error al cambiar el estado del producto');
    }
  }, []);

  // Computed values
  const activeProducts = products.filter(p => p.isActive);
  const inactiveProducts = products.filter(p => !p.isActive);

  return {
    // State
    products,
    loading,
    saving,
    error,
    showAddProduct,
    editingProduct,
    productForm,

    // Computed
    activeProducts,
    inactiveProducts,

    // Form updates
    setProductForm,

    // Actions
    fetchProducts,
    openAddModal,
    openEditModal,
    closeModal,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleToggleActive,
  };
}
