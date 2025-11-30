import { useProductsManagement } from "./useProductsManagement";
import { ProductHeader, ProductList } from "./components";
import { ProductModal } from "./modals";

interface FulVasoManagementProps {
  fieldId: string;
  fieldName: string;
  onBack: () => void;
}

export function FulVasoManagement({ fieldId, fieldName, onBack }: FulVasoManagementProps) {
  const {
    products,
    loading,
    saving,
    error,
    showAddProduct,
    editingProduct,
    productForm,
    setProductForm,
    fetchProducts,
    openAddModal,
    openEditModal,
    closeModal,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleToggleActive,
  } = useProductsManagement(fieldId);

  return (
    <div className="min-h-screen bg-white pb-20">
      <ProductHeader fieldName={fieldName} onBack={onBack} />

      <div className="p-4 space-y-6">
        <ProductList
          products={products}
          loading={loading}
          error={error}
          onRetry={fetchProducts}
          onAddClick={openAddModal}
          onToggleActive={handleToggleActive}
          onEdit={openEditModal}
          onDelete={handleDeleteProduct}
        />
      </div>

      <ProductModal
        open={showAddProduct || !!editingProduct}
        onClose={closeModal}
        product={productForm}
        onChange={setProductForm}
        onSave={editingProduct ? handleUpdateProduct : handleAddProduct}
        saving={saving}
        isEdit={!!editingProduct}
      />
    </div>
  );
}
