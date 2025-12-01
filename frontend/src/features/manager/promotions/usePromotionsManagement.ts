import { useState, useEffect, useCallback } from "react";
import { PromotionApi, Promotion } from "../../../services/api";
import { NewPromotionForm, INITIAL_PROMOTION_FORM } from "./types";

export function usePromotionsManagement(fieldId: string) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditPromotion, setShowEditPromotion] = useState<Promotion | null>(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState<Promotion | null>(null);

  // Form state
  const [newPromotion, setNewPromotion] = useState<NewPromotionForm>(INITIAL_PROMOTION_FORM);

  // Fetch promotions on mount
  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PromotionApi.getByField(fieldId);
      setPromotions(data);
    } catch (err) {
      setError('Error al cargar las promociones');
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  }, [fieldId]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Form actions
  const resetForm = useCallback(() => {
    setNewPromotion(INITIAL_PROMOTION_FORM);
  }, []);

  const openCreateModal = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false);
    resetForm();
  }, [resetForm]);

  const openEditModal = useCallback((promotion: Promotion) => {
    setShowEditPromotion(promotion);
  }, []);

  const closeEditModal = useCallback(() => {
    setShowEditPromotion(null);
  }, []);

  const openDeactivateDialog = useCallback((promotion: Promotion) => {
    setShowDeactivateDialog(promotion);
  }, []);

  const closeDeactivateDialog = useCallback(() => {
    setShowDeactivateDialog(null);
  }, []);

  // CRUD operations
  const handleCreatePromotion = useCallback(async () => {
    if (!newPromotion.title || !newPromotion.discountValue || !newPromotion.startDate || !newPromotion.endDate) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setSaving(true);
      const response = await PromotionApi.create(fieldId, {
        title: newPromotion.title,
        description: newPromotion.description || undefined,
        discountType: newPromotion.discountType,
        discountValue: parseFloat(newPromotion.discountValue),
        startDate: new Date(newPromotion.startDate).toISOString(),
        endDate: new Date(newPromotion.endDate).toISOString(),
      });
      setPromotions(prev => [response.promotion, ...prev]);
      closeCreateModal();
    } catch (err) {
      console.error('Error creating promotion:', err);
      alert('Error al crear la promoción');
    } finally {
      setSaving(false);
    }
  }, [fieldId, newPromotion, closeCreateModal]);

  const handleEditPromotion = useCallback(async () => {
    if (!showEditPromotion) return;

    try {
      setSaving(true);
      const response = await PromotionApi.update(showEditPromotion.id, {
        title: showEditPromotion.title,
        description: showEditPromotion.description || undefined,
        discountType: showEditPromotion.discountType,
        discountValue: showEditPromotion.discountValue,
        startDate: showEditPromotion.startDate,
        endDate: showEditPromotion.endDate,
        isActive: showEditPromotion.isActive,
      });
      setPromotions(prev => prev.map(p => p.id === showEditPromotion.id ? response.promotion : p));
      closeEditModal();
    } catch (err) {
      console.error('Error updating promotion:', err);
      alert('Error al actualizar la promoción');
    } finally {
      setSaving(false);
    }
  }, [showEditPromotion, closeEditModal]);

  const handleDeactivatePromotion = useCallback(async () => {
    if (!showDeactivateDialog) return;

    try {
      setSaving(true);
      await PromotionApi.deactivate(showDeactivateDialog.id);
      setPromotions(prev => 
        prev.map(p => p.id === showDeactivateDialog.id ? { ...p, isActive: false } : p)
      );
      closeDeactivateDialog();
    } catch (err) {
      console.error('Error deactivating promotion:', err);
      alert('Error al desactivar la promoción');
    } finally {
      setSaving(false);
    }
  }, [showDeactivateDialog, closeDeactivateDialog]);

  return {
    // State
    promotions,
    loading,
    saving,
    error,
    showCreateModal,
    showEditPromotion,
    showDeactivateDialog,
    newPromotion,

    // Form updates
    setNewPromotion,
    setShowEditPromotion,

    // Actions
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
  };
}
