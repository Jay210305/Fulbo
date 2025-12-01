import { X, ChevronLeft, ChevronRight, Upload, Check, Loader2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Checkbox } from "../../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { NewFieldForm } from "../types";
import { AMENITY_LIST } from "../components/AmenitiesList";

interface AddFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  newField: NewFieldForm;
  setNewField: React.Dispatch<React.SetStateAction<NewFieldForm>>;
  onSubmit: () => void;
  toggleAmenity: (amenity: string) => void;
  saving: boolean;
}

export function AddFieldModal({
  isOpen,
  onClose,
  currentStep,
  setCurrentStep,
  newField,
  setNewField,
  onSubmit,
  toggleAmenity,
  saving
}: AddFieldModalProps) {
  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
          <div>
            <h2>Agregar Nueva Cancha</h2>
            <p className="text-sm text-muted-foreground">Paso {currentStep} de 4</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-muted rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full ${
                  step <= currentStep ? 'bg-[#047857]' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Step1BasicInfo newField={newField} setNewField={setNewField} />
          )}

          {/* Step 2: Pricing */}
          {currentStep === 2 && (
            <Step2Pricing newField={newField} setNewField={setNewField} />
          )}

          {/* Step 3: Services & Images */}
          {currentStep === 3 && (
            <Step3Services 
              newField={newField} 
              setNewField={setNewField} 
              toggleAmenity={toggleAmenity}
            />
          )}

          {/* Step 4: Review & Publish */}
          {currentStep === 4 && (
            <Step4Review newField={newField} />
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrev} disabled={saving}>
              <ChevronLeft size={16} className="mr-2" />
              Anterior
            </Button>
          )}
          <Button
            className="flex-1 bg-[#047857] hover:bg-[#047857]/90"
            onClick={handleNext}
            disabled={saving}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {currentStep === 4 ? (
              <>Guardar y Publicar</>
            ) : (
              <>
                Siguiente
                <ChevronRight size={16} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Step Components
function Step1BasicInfo({ 
  newField, 
  setNewField 
}: { 
  newField: NewFieldForm; 
  setNewField: React.Dispatch<React.SetStateAction<NewFieldForm>>;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fieldName">Nombre de la Cancha *</Label>
        <Input
          id="fieldName"
          placeholder="Ej: Cancha Principal"
          className="h-12"
          value={newField.name}
          onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="fieldAddress">Dirección *</Label>
        <Input
          id="fieldAddress"
          placeholder="Ej: Av. Javier Prado 1234, San Isidro"
          className="h-12"
          value={newField.address}
          onChange={(e) => setNewField(prev => ({ ...prev, address: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="fieldType">Tipo de Cancha *</Label>
        <Select 
          value={newField.type} 
          onValueChange={(value: string) => setNewField(prev => ({ ...prev, type: value }))}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5v5">5 vs 5</SelectItem>
            <SelectItem value="7v7">7 vs 7</SelectItem>
            <SelectItem value="11v11">11 vs 11</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="surface">Tipo de Superficie *</Label>
        <Select 
          value={newField.surface} 
          onValueChange={(value: string) => setNewField(prev => ({ ...prev, surface: value }))}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Seleccionar superficie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sintetico">Sintético</SelectItem>
            <SelectItem value="natural">Grass Natural</SelectItem>
            <SelectItem value="cemento">Cemento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="maxCapacity">Capacidad Máxima *</Label>
        <Input
          id="maxCapacity"
          type="number"
          placeholder="Ej: 22"
          className="h-12"
          value={newField.maxCapacity}
          onChange={(e) => setNewField(prev => ({ ...prev, maxCapacity: e.target.value }))}
        />
      </div>
    </div>
  );
}

function Step2Pricing({ 
  newField, 
  setNewField 
}: { 
  newField: NewFieldForm; 
  setNewField: React.Dispatch<React.SetStateAction<NewFieldForm>>;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="basePrice">Precio Base por Hora *</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">S/</span>
          <Input
            id="basePrice"
            type="number"
            placeholder="50.00"
            className="h-12 pl-10"
            value={newField.basePrice}
            onChange={(e) => setNewField(prev => ({ ...prev, basePrice: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label>Precios en Horas Pico</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Define tarifas especiales para horarios de alta demanda
        </p>
        
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-muted p-3 grid grid-cols-2 gap-2 text-sm">
            <span>Período</span>
            <span>Precio Extra</span>
          </div>
          <div className="p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2 items-center">
              <span className="text-sm">Fin de Semana</span>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">+S/</span>
                <Input type="number" placeholder="10" className="h-10 pl-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 items-center">
              <span className="text-sm">Noche (19:00-23:00)</span>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">+S/</span>
                <Input type="number" placeholder="5" className="h-10 pl-10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3Services({ 
  newField, 
  setNewField,
  toggleAmenity
}: { 
  newField: NewFieldForm; 
  setNewField: React.Dispatch<React.SetStateAction<NewFieldForm>>;
  toggleAmenity: (amenity: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Servicios Disponibles</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Selecciona los servicios que ofrece esta cancha
        </p>
        
        <div className="space-y-3">
          {AMENITY_LIST.map((service) => {
            const Icon = service.icon;
            return (
              <div 
                key={service.id} 
                className="flex items-center space-x-3 p-3 border border-border rounded-lg"
              >
                <Checkbox
                  id={service.id}
                  checked={newField.amenities.includes(service.id)}
                  onCheckedChange={() => toggleAmenity(service.id)}
                />
                <Label 
                  htmlFor={service.id} 
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Icon size={18} className="text-[#047857]" />
                  <span>{service.name}</span>
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Galería de Fotos</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Sube imágenes de la cancha (máximo 5)
        </p>
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-[#047857] transition-colors">
          <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Haz clic para subir imágenes</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG - Máximo 2MB cada una</p>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          placeholder="Describe las características de la cancha..."
          className="min-h-24"
          value={newField.description}
          onChange={(e) => setNewField(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>
    </div>
  );
}

function Step4Review({ newField }: { newField: NewFieldForm }) {
  return (
    <div className="space-y-4">
      <div className="bg-secondary rounded-lg p-4">
        <h4 className="mb-3">Resumen de la Nueva Cancha</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nombre:</span>
            <span>{newField.name || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo:</span>
            <span>{newField.type || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Superficie:</span>
            <span>{newField.surface || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Capacidad:</span>
            <span>{newField.maxCapacity || '-'} jugadores</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Precio Base:</span>
            <span>S/ {newField.basePrice || '0'}/h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Servicios:</span>
            <span>{newField.amenities.length} seleccionados</span>
          </div>
        </div>
      </div>

      <div className="bg-[#dcfce7] border border-[#047857] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Check size={20} className="text-[#047857] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="mb-1">¡Listo para publicar!</h4>
            <p className="text-sm text-muted-foreground">
              Tu cancha aparecerá inmediatamente en el listado de Fulbo y estará disponible para reservas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
