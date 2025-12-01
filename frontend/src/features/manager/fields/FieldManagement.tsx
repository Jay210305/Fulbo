import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";

// Feature imports
import { useFieldManagement } from "./hooks";
import { FieldCard, FieldStats, EmptyFieldsState } from "./components";
import {
  AddFieldModal,
  EditPriceModal,
  BulkEditModal,
  AvailabilityModal,
  FieldDetailsModal,
  DeleteFieldDialog,
} from "./modals";
import { FieldDisplay } from "./types";

// External feature imports (sub-screens)
import { FulVasoManagement } from "../../../components/manager/FulVasoManagement";
import { PromotionsManagement } from "../../../components/manager/PromotionsManagement";

export function FieldManagement() {
  // Hook for all field management logic
  const {
    fields,
    loading,
    error,
    saving,
    createField,
    updateField,
    deleteField,
    toggleFullVaso,
    updateFullVasoPromo,
    clearError,
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
    toggleAmenity,
  } = useFieldManagement();

  // UI/Navigation state
  const [showFulVaso, setShowFulVaso] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);
  const [selectedField, setSelectedField] = useState<{ id: string; name: string } | null>(null);

  // Modal states
  const [showAddField, setShowAddField] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [showFieldDetails, setShowFieldDetails] = useState<FieldDisplay | null>(null);
  const [showEditPrice, setShowEditPrice] = useState<FieldDisplay | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<FieldDisplay | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Handler functions
  const handleAddFieldSubmit = async () => {
    const success = await createField(newField);
    if (success) {
      setShowAddField(false);
      setCurrentStep(1);
      resetNewField();
    }
  };

  const handleEditPriceSave = async () => {
    if (showEditPrice) {
      const success = await updateField(showEditPrice.id, {
        basePricePerHour: parseFloat(editPriceData.basePrice) || showEditPrice.price
      });
      if (success) {
        setShowEditPrice(null);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (showDeleteConfirm) {
      const success = await deleteField(showDeleteConfirm.id);
      if (success) {
        setShowDeleteConfirm(null);
      }
    }
  };

  const openEditPriceModal = (field: FieldDisplay) => {
    setShowEditPrice(field);
    initEditPriceData(field);
  };

  const openFulVaso = (field: FieldDisplay) => {
    setSelectedField({ id: field.id, name: field.name });
    setShowFulVaso(true);
  };

  const openPromotions = (field: FieldDisplay) => {
    setSelectedField({ id: field.id, name: field.name });
    setShowPromotions(true);
  };

  // Computed values
  const activeCount = fields.filter(f => f.status === 'active').length;
  const totalRevenue = fields.reduce((acc, f) => acc + f.totalRevenue, 0);
  const totalBookings = fields.reduce((acc, f) => acc + f.bookings, 0);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#047857]" />
          <p className="text-muted-foreground">Cargando canchas...</p>
        </div>
      </div>
    );
  }

  // Sub-screens (FulVaso / Promotions)
  if (showFulVaso && selectedField) {
    return (
      <FulVasoManagement
        fieldId={selectedField.id}
        fieldName={selectedField.name}
        onBack={() => {
          setShowFulVaso(false);
          setSelectedField(null);
        }}
      />
    );
  }

  if (showPromotions && selectedField) {
    return (
      <PromotionsManagement
        fieldId={selectedField.id}
        fieldName={selectedField.name}
        onBack={() => {
          setShowPromotions(false);
          setSelectedField(null);
        }}
      />
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header Section */}
        <div>
          <h1 className="text-2xl mb-6">Gestión de Canchas</h1>
          
          <FieldStats 
            activeCount={activeCount}
            totalRevenue={totalRevenue}
            totalBookings={totalBookings}
          />

          {/* Action Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
            <Button 
              className="bg-[#047857] hover:bg-[#047857]/90 whitespace-nowrap"
              onClick={() => setShowAddField(true)}
            >
              <Plus size={16} className="mr-2" />
              Agregar Cancha
            </Button>
            <Button 
              variant="outline" 
              className="whitespace-nowrap"
              onClick={() => setShowBulkEdit(true)}
              disabled={fields.length === 0}
            >
              Edición Masiva
            </Button>
            <Button 
              variant="outline" 
              className="whitespace-nowrap"
              onClick={() => setShowAvailability(true)}
            >
              Configurar Disponibilidad
            </Button>
          </div>
        </div>

        {/* Fields List */}
        <div className="space-y-4">
          {fields.length === 0 ? (
            <EmptyFieldsState onAddField={() => setShowAddField(true)} />
          ) : (
            fields.map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                onViewDetails={() => setShowFieldDetails(field)}
                onEditPrice={() => openEditPriceModal(field)}
                onDelete={() => setShowDeleteConfirm(field)}
                onFulVaso={() => openFulVaso(field)}
                onPromotions={() => openPromotions(field)}
                onToggleFullVaso={() => toggleFullVaso(field.id)}
                onUpdateFullVasoPromo={(promo) => updateFullVasoPromo(field.id, promo)}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <AddFieldModal
        isOpen={showAddField}
        onClose={() => {
          setShowAddField(false);
          setCurrentStep(1);
          resetNewField();
        }}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        newField={newField}
        setNewField={setNewField}
        onSubmit={handleAddFieldSubmit}
        toggleAmenity={toggleAmenity}
        saving={saving}
      />

      <EditPriceModal
        field={showEditPrice}
        onClose={() => setShowEditPrice(null)}
        editPriceData={editPriceData}
        setEditPriceData={setEditPriceData}
        onSave={handleEditPriceSave}
        saving={saving}
      />

      <BulkEditModal
        isOpen={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        fields={fields}
        selectedFieldsForBulk={selectedFieldsForBulk}
        setSelectedFieldsForBulk={setSelectedFieldsForBulk}
        bulkEditData={bulkEditData}
        setBulkEditData={setBulkEditData}
        onApply={applyBulkEdit}
      />

      <AvailabilityModal
        isOpen={showAvailability}
        onClose={() => setShowAvailability(false)}
      />

      <FieldDetailsModal
        field={showFieldDetails}
        onClose={() => setShowFieldDetails(null)}
      />

      <DeleteFieldDialog
        field={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        saving={saving}
      />
    </div>
  );
}
