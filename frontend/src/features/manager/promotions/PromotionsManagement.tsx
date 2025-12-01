import { usePromotionsManagement } from "./usePromotionsManagement";
import { PromotionsHeader, PromotionsList } from "./components";
import { CreatePromotionModal, EditPromotionModal, DeactivatePromotionDialog } from "./modals";

interface PromotionsManagementProps {
  fieldId: string;
  fieldName: string;
  onBack: () => void;
}

export function PromotionsManagement({ fieldId, fieldName, onBack }: PromotionsManagementProps) {
  const {
    promotions,
    loading,
    saving,
    error,
    showCreateModal,
    showEditPromotion,
    showDeactivateDialog,
    newPromotion,
    setNewPromotion,
    setShowEditPromotion,
    fetchPromotions,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeactivateDialog,
    closeDeactivateDialog,
    handleCreatePromotion,
    handleEditPromotion,
    handleDeactivatePromotion,
  } = usePromotionsManagement(fieldId);

  return (
    <div className="min-h-screen bg-white pb-20">
      <PromotionsHeader fieldName={fieldName} onBack={onBack} />

      <div className="p-4 space-y-6">
        <PromotionsList
          promotions={promotions}
          loading={loading}
          error={error}
          onRetry={fetchPromotions}
          onCreateClick={openCreateModal}
          onEditClick={openEditModal}
          onDeactivateClick={openDeactivateDialog}
        />
      </div>

      <CreatePromotionModal
        open={showCreateModal}
        onClose={closeCreateModal}
        promotion={newPromotion}
        onChange={setNewPromotion}
        onSave={handleCreatePromotion}
        saving={saving}
      />

      <EditPromotionModal
        open={!!showEditPromotion}
        onClose={closeEditModal}
        promotion={showEditPromotion}
        onChange={setShowEditPromotion}
        onSave={handleEditPromotion}
        saving={saving}
      />

      <DeactivatePromotionDialog
        open={!!showDeactivateDialog}
        onClose={closeDeactivateDialog}
        promotionTitle={showDeactivateDialog?.title}
        onConfirm={handleDeactivatePromotion}
        saving={saving}
      />
    </div>
  );
}
