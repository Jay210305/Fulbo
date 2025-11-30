import { useState } from 'react';
import {
  Plan,
  Promotion,
  NewPromotionForm,
  PromotionType,
  INITIAL_PROMOTION_FORM,
  MOCK_PROMOTIONS,
  MOCK_CAMPAIGNS,
  MOCK_FIELDS,
  PLANS,
} from '../types';

export function useAdvertising() {
  // Modal visibility
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [showCreatePromotion, setShowCreatePromotion] = useState(false);
  const [showEditPromotion, setShowEditPromotion] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Selected items
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  // Data
  const [promotions, setPromotions] = useState<Promotion[]>(MOCK_PROMOTIONS);
  const campaigns = MOCK_CAMPAIGNS;
  const fields = MOCK_FIELDS;
  const plans = PLANS;

  // Form state
  const [newPromotion, setNewPromotion] = useState<NewPromotionForm>(INITIAL_PROMOTION_FORM);

  // ============================================================================
  // Plan Handlers
  // ============================================================================

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = () => {
    alert(`Plan "${selectedPlan?.name}" adquirido exitosamente`);
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  const handleRenewCampaign = () => {
    alert('Renovando campaña con el mismo plan...');
    setShowRenewDialog(false);
  };

  // ============================================================================
  // Promotion Handlers
  // ============================================================================

  const resetPromotionForm = () => {
    setNewPromotion(INITIAL_PROMOTION_FORM);
  };

  const handleCreatePromotion = () => {
    const promo: Promotion = {
      id: Date.now(),
      type: newPromotion.type,
      name: newPromotion.name,
      description: newPromotion.description,
      value: newPromotion.value,
      field: newPromotion.field,
      startDate: newPromotion.startDate?.toISOString() || '',
      endDate: newPromotion.endDate?.toISOString() || '',
      status: 'active',
    };

    setPromotions([...promotions, promo]);
    alert('Promoción creada exitosamente');
    setShowCreatePromotion(false);
    resetPromotionForm();
  };

  const handleEditPromotion = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setNewPromotion({
      type: promo.type,
      name: promo.name,
      description: promo.description,
      value: promo.value,
      field: promo.field,
      startDate: new Date(promo.startDate),
      endDate: new Date(promo.endDate),
    });
    setShowEditPromotion(true);
  };

  const handleUpdatePromotion = () => {
    if (!selectedPromotion) return;

    const updatedPromotions = promotions.map((p) =>
      p.id === selectedPromotion.id
        ? {
            ...p,
            type: newPromotion.type,
            name: newPromotion.name,
            description: newPromotion.description,
            value: newPromotion.value,
            field: newPromotion.field,
            startDate: newPromotion.startDate?.toISOString() || '',
            endDate: newPromotion.endDate?.toISOString() || '',
          }
        : p
    );

    setPromotions(updatedPromotions);
    alert('Promoción actualizada exitosamente');
    setShowEditPromotion(false);
    setSelectedPromotion(null);
    resetPromotionForm();
  };

  const handleDeactivatePromotion = () => {
    if (!selectedPromotion) return;

    const updatedPromotions = promotions.map((p) =>
      p.id === selectedPromotion.id ? { ...p, status: 'inactive' as const } : p
    );

    setPromotions(updatedPromotions);
    alert('Promoción desactivada exitosamente');
    setShowDeactivateDialog(false);
    setSelectedPromotion(null);
  };

  const handleActivatePromotion = (promo: Promotion) => {
    const updatedPromotions = promotions.map((p) =>
      p.id === promo.id ? { ...p, status: 'active' as const } : p
    );

    setPromotions(updatedPromotions);
    alert('Promoción activada exitosamente');
  };

  const handleDeletePromotion = () => {
    if (!selectedPromotion) return;

    const updatedPromotions = promotions.filter((p) => p.id !== selectedPromotion.id);
    setPromotions(updatedPromotions);
    alert('Promoción eliminada permanentemente');
    setShowDeleteDialog(false);
    setSelectedPromotion(null);
  };

  const openDeactivateDialog = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setShowDeactivateDialog(true);
  };

  const openDeleteDialog = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setShowDeleteDialog(true);
  };

  const closePromotionForm = () => {
    setShowCreatePromotion(false);
    setShowEditPromotion(false);
    setSelectedPromotion(null);
    resetPromotionForm();
  };

  const updatePromotionField = (field: keyof NewPromotionForm, value: string | Date | undefined | PromotionType) => {
    setNewPromotion((prev) => ({ ...prev, [field]: value }));
  };

  return {
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
  };
}
