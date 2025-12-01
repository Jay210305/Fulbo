import { useState, useEffect, useCallback } from "react";
import { managerApi, StaffMember } from "../../../services/manager.api";
import { NewStaffForm, StaffPermissions, INITIAL_NEW_STAFF } from "./types";

export function useStaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form states
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [newStaff, setNewStaff] = useState<NewStaffForm>(INITIAL_NEW_STAFF);

  // Fetch staff on mount
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const data = await managerApi.staff.getAll();
        setStaff(data);
      } catch (err) {
        console.error('Error fetching staff:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  // Add staff handlers
  const openAddDialog = useCallback(() => {
    setShowAddDialog(true);
  }, []);

  const closeAddDialog = useCallback(() => {
    setShowAddDialog(false);
    setNewStaff(INITIAL_NEW_STAFF);
  }, []);

  const updateNewStaff = useCallback((updates: Partial<NewStaffForm>) => {
    setNewStaff(prev => ({ ...prev, ...updates }));
  }, []);

  const updateNewStaffPermission = useCallback((key: keyof StaffPermissions, value: boolean) => {
    setNewStaff(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: value }
    }));
  }, []);

  const handleAddStaff = useCallback(async () => {
    try {
      setSaving(true);
      const result = await managerApi.staff.create({
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.role,
        permissions: newStaff.permissions as unknown as Record<string, boolean>
      });
      
      setStaff(prev => [...prev, result.staff]);
      alert(`${newStaff.name} ha sido agregado al equipo.`);
      closeAddDialog();
    } catch (err) {
      console.error('Error adding staff:', err);
      alert('Error al agregar empleado');
    } finally {
      setSaving(false);
    }
  }, [newStaff, closeAddDialog]);

  // Edit staff handlers
  const openEditDialog = useCallback((member: StaffMember) => {
    setSelectedStaff(member);
    setShowEditDialog(true);
  }, []);

  const closeEditDialog = useCallback(() => {
    setShowEditDialog(false);
    setSelectedStaff(null);
  }, []);

  const updateSelectedStaff = useCallback((updates: Partial<StaffMember>) => {
    setSelectedStaff(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const handleEditStaff = useCallback(async () => {
    if (!selectedStaff) return;
    
    try {
      setSaving(true);
      const result = await managerApi.staff.update(selectedStaff.id, {
        name: selectedStaff.name,
        email: selectedStaff.email,
        phone: selectedStaff.phone || undefined,
        role: selectedStaff.role,
        permissions: selectedStaff.permissions
      });
      
      setStaff(prev => prev.map(s => s.id === selectedStaff.id ? result.staff : s));
      alert('Empleado actualizado exitosamente');
      closeEditDialog();
    } catch (err) {
      console.error('Error updating staff:', err);
      alert('Error al actualizar empleado');
    } finally {
      setSaving(false);
    }
  }, [selectedStaff, closeEditDialog]);

  // Delete staff handlers
  const openDeleteDialog = useCallback((member: StaffMember) => {
    setSelectedStaff(member);
    setShowDeleteDialog(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false);
    setSelectedStaff(null);
  }, []);

  const handleDeleteStaff = useCallback(async () => {
    if (!selectedStaff) return;
    
    try {
      setSaving(true);
      await managerApi.staff.delete(selectedStaff.id);
      setStaff(prev => prev.filter(s => s.id !== selectedStaff.id));
      alert(`${selectedStaff.name} ha sido removido del equipo`);
      closeDeleteDialog();
    } catch (err) {
      console.error('Error deleting staff:', err);
      alert('Error al eliminar empleado');
    } finally {
      setSaving(false);
    }
  }, [selectedStaff, closeDeleteDialog]);

  return {
    // State
    staff,
    loading,
    saving,
    showAddDialog,
    showEditDialog,
    showDeleteDialog,
    newStaff,
    selectedStaff,

    // Add dialog actions
    openAddDialog,
    closeAddDialog,
    updateNewStaff,
    updateNewStaffPermission,
    handleAddStaff,

    // Edit dialog actions
    openEditDialog,
    closeEditDialog,
    updateSelectedStaff,
    handleEditStaff,

    // Delete dialog actions
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteStaff,
  };
}
