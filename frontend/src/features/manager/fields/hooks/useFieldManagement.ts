import { useState, useEffect, useCallback } from "react";
import { managerApi } from "../../../../services/manager.api";
import {
  FieldDisplay,
  NewFieldForm,
  EditPriceForm,
  BulkEditForm,
  mapFieldToDisplay,
  INITIAL_NEW_FIELD,
  INITIAL_EDIT_PRICE,
  INITIAL_BULK_EDIT
} from "../types";

interface UseFieldManagementReturn {
  // Data
  fields: FieldDisplay[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  
  // Actions
  fetchFields: () => Promise<void>;
  createField: (data: NewFieldForm) => Promise<boolean>;
  updateField: (fieldId: string, data: { basePricePerHour?: number; name?: string; address?: string; description?: string }) => Promise<boolean>;
  deleteField: (fieldId: string) => Promise<boolean>;
  toggleFullVaso: (fieldId: string) => void;
  updateFullVasoPromo: (fieldId: string, promo: string) => void;
  clearError: () => void;
  
  // Form states
  newField: NewFieldForm;
  setNewField: React.Dispatch<React.SetStateAction<NewFieldForm>>;
  resetNewField: () => void;
  
  editPriceData: EditPriceForm;
  setEditPriceData: React.Dispatch<React.SetStateAction<EditPriceForm>>;
  initEditPriceData: (field: FieldDisplay) => void;
  
  bulkEditData: BulkEditForm;
  setBulkEditData: React.Dispatch<React.SetStateAction<BulkEditForm>>;
  selectedFieldsForBulk: string[];
  setSelectedFieldsForBulk: React.Dispatch<React.SetStateAction<string[]>>;
  applyBulkEdit: () => void;
  
  // Amenity helpers
  toggleAmenity: (amenity: string) => void;
}

export function useFieldManagement(): UseFieldManagementReturn {
  // API state
  const [fields, setFields] = useState<FieldDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [newField, setNewField] = useState<NewFieldForm>(INITIAL_NEW_FIELD);
  const [editPriceData, setEditPriceData] = useState<EditPriceForm>(INITIAL_EDIT_PRICE);
  const [bulkEditData, setBulkEditData] = useState<BulkEditForm>(INITIAL_BULK_EDIT);
  const [selectedFieldsForBulk, setSelectedFieldsForBulk] = useState<string[]>([]);

  // Fetch fields on mount
  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fieldsFromApi = await managerApi.fields.getAll();
      setFields(fieldsFromApi.map(mapFieldToDisplay));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las canchas';
      console.error('Error fetching fields:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createField = useCallback(async (data: NewFieldForm): Promise<boolean> => {
    try {
      setSaving(true);
      const amenitiesObj: Record<string, boolean> = {};
      data.amenities.forEach(a => amenitiesObj[a] = true);

      await managerApi.fields.create({
        name: data.name,
        address: data.address || 'Dirección por definir',
        description: data.description,
        amenities: amenitiesObj,
        basePricePerHour: parseFloat(data.basePrice) || 0,
      });

      await fetchFields();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la cancha';
      console.error('Error creating field:', err);
      setError(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchFields]);

  const updateField = useCallback(async (
    fieldId: string, 
    data: { basePricePerHour?: number; name?: string; address?: string; description?: string }
  ): Promise<boolean> => {
    try {
      setSaving(true);
      await managerApi.fields.update(fieldId, data);
      await fetchFields();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la cancha';
      console.error('Error updating field:', err);
      setError(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchFields]);

  const deleteField = useCallback(async (fieldId: string): Promise<boolean> => {
    try {
      setSaving(true);
      await managerApi.fields.delete(fieldId);
      await fetchFields();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la cancha';
      console.error('Error deleting field:', err);
      setError(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchFields]);

  const toggleFullVaso = useCallback((fieldId: string) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId 
        ? { ...field, hasFullVaso: !field.hasFullVaso }
        : field
    ));
  }, []);

  const updateFullVasoPromo = useCallback((fieldId: string, promo: string) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId 
        ? { ...field, fullVasoPromo: promo }
        : field
    ));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetNewField = useCallback(() => {
    setNewField(INITIAL_NEW_FIELD);
  }, []);

  const initEditPriceData = useCallback((field: FieldDisplay) => {
    setEditPriceData({
      basePrice: field.price.toString(),
      weekendExtra: '10',
      nightExtra: '5',
      promoDescription: field.fullVasoPromo
    });
  }, []);

  const toggleAmenity = useCallback((amenity: string) => {
    setNewField(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  }, []);

  const applyBulkEdit = useCallback(() => {
    console.log('Bulk edit applied to fields:', selectedFieldsForBulk, bulkEditData);
    setSelectedFieldsForBulk([]);
    setBulkEditData(INITIAL_BULK_EDIT);
  }, [selectedFieldsForBulk, bulkEditData]);

  return {
    // Data
    fields,
    loading,
    error,
    saving,
    
    // Actions
    fetchFields,
    createField,
    updateField,
    deleteField,
    toggleFullVaso,
    updateFullVasoPromo,
    clearError,
    
    // Form states
    newField,
    setNewField,
    resetNewField,
    
    editPriceData,
    setEditPriceData,
    initEditPriceData,
    
    bulkEditData,
    setBulkEditData,
    selectedFieldsForBulk,
    setSelectedFieldsForBulk,
    applyBulkEdit,
    
    // Amenity helpers
    toggleAmenity,
  };
}
