import { useStaffManagement } from "./useStaffManagement";
import { StaffHeader, AccessControlInfo, StaffList } from "./components";
import { AddStaffModal, EditStaffModal, DeleteStaffDialog } from "./modals";
import { StaffPermissions } from "./types";

interface StaffManagementScreenProps {
  onBack: () => void;
}

export function StaffManagementScreen({ onBack }: StaffManagementScreenProps) {
  const {
    staff,
    loading,
    saving,
    showAddDialog,
    showEditDialog,
    showDeleteDialog,
    newStaff,
    selectedStaff,
    openAddDialog,
    closeAddDialog,
    updateNewStaff,
    updateNewStaffPermission,
    handleAddStaff,
    openEditDialog,
    closeEditDialog,
    updateSelectedStaff,
    handleEditStaff,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteStaff,
  } = useStaffManagement();

  const handlePermissionChange = (key: keyof StaffPermissions, value: boolean) => {
    updateNewStaffPermission(key, value);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <StaffHeader 
        onBack={onBack} 
        onAdd={openAddDialog} 
      />

      <div className="p-4 space-y-6">
        <AccessControlInfo />
        
        <StaffList
          staff={staff}
          loading={loading}
          onAdd={openAddDialog}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
        />
      </div>

      <AddStaffModal
        open={showAddDialog}
        onClose={closeAddDialog}
        staff={newStaff}
        onChange={updateNewStaff}
        onPermissionChange={handlePermissionChange}
        onSave={handleAddStaff}
        saving={saving}
      />

      <EditStaffModal
        open={showEditDialog}
        onClose={closeEditDialog}
        staff={selectedStaff}
        onStaffChange={(staff) => updateSelectedStaff(staff)}
        onSave={handleEditStaff}
        saving={saving}
      />

      <DeleteStaffDialog
        open={showDeleteDialog}
        onClose={closeDeleteDialog}
        staffName={selectedStaff?.name}
        onConfirm={handleDeleteStaff}
        saving={saving}
      />
    </div>
  );
}
