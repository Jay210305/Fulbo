import { useAdvertising } from './hooks';
import {
  AdvertisingHeader,
  ActiveCampaigns,
  PlansList,
  PromotionsList,
} from './components';
import {
  RenewCampaignModal,
  PromotionFormModal,
  DeactivatePromotionDialog,
  DeletePromotionDialog,
  PaymentModal,
} from './modals';

export function AdvertisingScreen() {
  const {
    // Modal visibility
    showPaymentModal,
    setShowPaymentModal,
    showRenewDialog,
    setShowRenewDialog,
    showCreatePromotion,
    setShowCreatePromotion,
    showEditPromotion,
    showDeactivateDialog,
    setShowDeactivateDialog,
    showDeleteDialog,
    setShowDeleteDialog,

    // Selected items
    selectedPlan,
    selectedPromotion,

    // Data
    promotions,
    campaigns,
    fields,
    plans,

    // Form
    newPromotion,
    updatePromotionField,

    // Plan handlers
    handleSelectPlan,
    handlePayment,
    handleRenewCampaign,

    // Promotion handlers
    handleCreatePromotion,
    handleEditPromotion,
    handleUpdatePromotion,
    handleDeactivatePromotion,
    handleActivatePromotion,
    handleDeletePromotion,
    openDeactivateDialog,
    openDeleteDialog,
    closePromotionForm,
  } = useAdvertising();

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 space-y-6">
        {/* Header */}
        <AdvertisingHeader />

        {/* Active Campaigns */}
        <ActiveCampaigns campaigns={campaigns} onRenew={() => setShowRenewDialog(true)} />

        {/* Plans */}
        <PlansList plans={plans} onSelectPlan={handleSelectPlan} />

        {/* Promotions Section */}
        <PromotionsList
          promotions={promotions}
          onCreatePromotion={() => setShowCreatePromotion(true)}
          onEditPromotion={handleEditPromotion}
          onDeactivatePromotion={openDeactivateDialog}
          onActivatePromotion={handleActivatePromotion}
          onDeletePromotion={openDeleteDialog}
        />
      </div>

      {/* Modals */}
      <RenewCampaignModal
        open={showRenewDialog}
        onOpenChange={setShowRenewDialog}
        plans={plans}
        onRenew={handleRenewCampaign}
      />

      <PromotionFormModal
        open={showCreatePromotion || showEditPromotion}
        onOpenChange={(open) => {
          if (!open) closePromotionForm();
        }}
        isEdit={showEditPromotion}
        fields={fields}
        formData={newPromotion}
        onFieldChange={updatePromotionField}
        onSubmit={showEditPromotion ? handleUpdatePromotion : handleCreatePromotion}
        onCancel={closePromotionForm}
      />

      <DeactivatePromotionDialog
        open={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
        promotion={selectedPromotion}
        onConfirm={handleDeactivatePromotion}
      />

      <DeletePromotionDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        promotion={selectedPromotion}
        onConfirm={handleDeletePromotion}
      />

      {selectedPlan && (
        <PaymentModal
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          plan={selectedPlan}
          fields={fields}
          onConfirmPayment={handlePayment}
        />
      )}
    </div>
  );
}
