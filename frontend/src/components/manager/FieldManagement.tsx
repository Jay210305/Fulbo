import { useState, useEffect } from "react";
import { Plus, Star, MapPin, Car, Shirt, Lightbulb, ShoppingBag, TrendingUp, Wine, Edit2, X, Upload, Calendar, Check, ChevronLeft, ChevronRight, Wifi, Loader2, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { FulVasoManagement } from "./FulVasoManagement";
import { PromotionsManagement } from "./PromotionsManagement";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { managerApi, Field } from "../../services/manager.api";

const amenityIcons: Record<string, any> = {
  floodlights: Lightbulb,
  parking: Car,
  changing: Shirt,
  wifi: Wifi
};

const amenityNames: Record<string, string> = {
  floodlights: 'Iluminación',
  parking: 'Estacionamiento',
  changing: 'Vestuarios',
  wifi: 'WiFi'
};

// Helper to convert backend Field to display format
interface FieldDisplay {
  id: string;
  name: string;
  status: 'active' | 'maintenance';
  rating: number;
  capacity: string;
  price: number;
  bookings: number;
  nextBooking: string;
  amenities: string[];
  hasFullVaso: boolean;
  fullVasoPromo: string;
  surface: string;
  maxCapacity: number;
  totalRevenue: number;
  occupancyRate: number;
  description: string;
  address: string;
  images: string[];
}

function mapFieldToDisplay(field: Field): FieldDisplay {
  const amenitiesArray = Object.entries(field.amenities || {})
    .filter(([, value]) => value)
    .map(([key]) => key);

  return {
    id: field.id,
    name: field.name,
    status: 'active',
    rating: 4.5,
    capacity: '7v7',
    price: field.basePricePerHour,
    bookings: field.stats.bookingsCount,
    nextBooking: '-',
    amenities: amenitiesArray,
    hasFullVaso: field.promotions.some(p => p.isActive),
    fullVasoPromo: field.promotions.find(p => p.isActive)?.description || '',
    surface: 'Sintético',
    maxCapacity: 14,
    totalRevenue: 0,
    occupancyRate: 0,
    description: field.description || '',
    address: field.address,
    images: field.photos.length > 0 
      ? field.photos.map(p => p.url) 
      : ['https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800']
  };
}

export function FieldManagement() {
  // API state
  const [fieldsData, setFieldsData] = useState<FieldDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // UI state
  const [showFulVaso, setShowFulVaso] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  
  // Modal states
  const [showAddField, setShowAddField] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [showFieldDetails, setShowFieldDetails] = useState<FieldDisplay | null>(null);
  const [showEditPrice, setShowEditPrice] = useState<FieldDisplay | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<FieldDisplay | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [newField, setNewField] = useState({
    name: '',
    address: '',
    type: '',
    surface: '',
    maxCapacity: '',
    basePrice: '',
    peakHourPrice: '',
    amenities: [] as string[],
    description: ''
  });

  const [selectedFieldsForBulk, setSelectedFieldsForBulk] = useState<string[]>([]);
  const [bulkEditData, setBulkEditData] = useState({
    priceAdjustment: '',
    adjustmentType: 'percentage' as 'percentage' | 'fixed'
  });

  const [availabilityData, setAvailabilityData] = useState({
    selectedDate: new Date(),
    blockedSlots: [] as string[],
    blockReason: '',
    openingHours: '08:00',
    closingHours: '23:00'
  });

  const [editPriceData, setEditPriceData] = useState({
    basePrice: '',
    weekendExtra: '',
    nightExtra: '',
    promoDescription: ''
  });

  // Fetch fields on mount
  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      setLoading(true);
      setError(null);
      const fields = await managerApi.fields.getAll();
      setFieldsData(fields.map(mapFieldToDisplay));
    } catch (err: any) {
      console.error('Error fetching fields:', err);
      setError(err.message || 'Error al cargar las canchas');
    } finally {
      setLoading(false);
    }
  };

  const toggleFullVaso = (fieldId: string) => {
    setFieldsData(prev => prev.map(field => 
      field.id === fieldId 
        ? { ...field, hasFullVaso: !field.hasFullVaso }
        : field
    ));
  };

  const updateFullVasoPromo = (fieldId: string, promo: string) => {
    setFieldsData(prev => prev.map(field => 
      field.id === fieldId 
        ? { ...field, fullVasoPromo: promo }
        : field
    ));
  };

  const handleAddField = async () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Save new field to API
      try {
        setSaving(true);
        const amenitiesObj: Record<string, boolean> = {};
        newField.amenities.forEach(a => amenitiesObj[a] = true);

        await managerApi.fields.create({
          name: newField.name,
          address: newField.address || 'Dirección por definir',
          description: newField.description,
          amenities: amenitiesObj,
          basePricePerHour: parseFloat(newField.basePrice) || 0,
        });

        // Refresh the list
        await fetchFields();

        setShowAddField(false);
        setCurrentStep(1);
        setNewField({
          name: '',
          address: '',
          type: '',
          surface: '',
          maxCapacity: '',
          basePrice: '',
          peakHourPrice: '',
          amenities: [],
          description: ''
        });
      } catch (err: any) {
        console.error('Error creating field:', err);
        setError(err.message || 'Error al crear la cancha');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleUpdateField = async (fieldId: string, data: { basePricePerHour?: number; name?: string; address?: string; description?: string }) => {
    try {
      setSaving(true);
      await managerApi.fields.update(fieldId, data);
      await fetchFields();
      setShowEditPrice(null);
    } catch (err: any) {
      console.error('Error updating field:', err);
      setError(err.message || 'Error al actualizar la cancha');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    try {
      setSaving(true);
      await managerApi.fields.delete(fieldId);
      await fetchFields();
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error('Error deleting field:', err);
      setError(err.message || 'Error al eliminar la cancha');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkEdit = () => {
    console.log('Bulk edit applied to fields:', selectedFieldsForBulk, bulkEditData);
    setShowBulkEdit(false);
    setSelectedFieldsForBulk([]);
  };

  const toggleAmenity = (amenity: string) => {
    setNewField(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

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

  if (showFulVaso && selectedField) {
    return (
      <FulVasoManagement
        fieldName={selectedField}
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
        fieldName={selectedField}
        onBack={() => {
          setShowPromotions(false);
          setSelectedField(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 space-y-6">
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X size={16} />
            </button>
          </div>
        )}

        <div>
          <h1 className="text-2xl mb-6">Gestión de Canchas</h1>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-xl text-[#047857] mb-1">{fieldsData.filter(f => f.status === 'active').length}</p>
              <p className="text-xs text-muted-foreground">Canchas Activas</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-xl text-[#047857] mb-1">S/ {fieldsData.reduce((acc, f) => acc + f.totalRevenue, 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Ingresos Total</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-xl text-[#047857] mb-1">{fieldsData.reduce((acc, f) => acc + f.bookings, 0)}</p>
              <p className="text-xs text-muted-foreground">Reservas</p>
            </div>
          </div>

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
              disabled={fieldsData.length === 0}
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

        <div className="space-y-4">
          {fieldsData.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <MapPin size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg mb-2">No tienes canchas registradas</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Agrega tu primera cancha para comenzar a recibir reservas
              </p>
              <Button 
                className="bg-[#047857] hover:bg-[#047857]/90"
                onClick={() => setShowAddField(true)}
              >
                <Plus size={16} className="mr-2" />
                Agregar Cancha
              </Button>
            </div>
          ) : (
            fieldsData.map((field) => (
            <div key={field.id} className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3>{field.name}</h3>
                    {field.status === 'active' ? (
                      <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                        Activa
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Mantenimiento</Badge>
                    )}
                    {field.hasFullVaso && (
                      <Badge className="bg-purple-600 hover:bg-purple-600/90 text-white border-none">
                        <Wine size={12} className="mr-1" />
                        Full Vaso
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star size={14} fill="#facc15" className="text-[#facc15]" />
                      <span>{field.rating}</span>
                    </div>
                    <span>{field.capacity}</span>
                    {field.address && (
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span className="truncate max-w-[150px]">{field.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(field)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Eliminar cancha"
                  >
                    <Trash2 size={18} />
                  </button>
                  <Switch checked={field.status === 'active'} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Precio</p>
                  <p className="text-[#047857]">S/ {field.price}/h</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Reservas</p>
                  <p>{field.bookings}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Próxima</p>
                  <p>{field.nextBooking}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Servicios</p>
                <div className="flex gap-2">
                  {field.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity];
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs"
                      >
                        <Icon size={12} />
                        <span>{amenityNames[amenity]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full Vaso Section */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wine size={18} className="text-purple-600" />
                    <Label htmlFor={`fullvaso-${field.id}`}>Esta cancha ofrece Full Vaso</Label>
                  </div>
                  <Switch 
                    id={`fullvaso-${field.id}`}
                    checked={field.hasFullVaso}
                    onCheckedChange={() => toggleFullVaso(field.id)}
                  />
                </div>

                {field.hasFullVaso && (
                  <div className="space-y-2">
                    <Label htmlFor={`promo-${field.id}`} className="text-sm">
                      Descripción de la Promoción Full Vaso
                    </Label>
                    <Textarea
                      id={`promo-${field.id}`}
                      placeholder="Ej: 2x1 en cervezas al reservar, Balde de 5 cervezas + piqueo - S/25"
                      value={field.fullVasoPromo}
                      onChange={(e) => updateFullVasoPromo(field.id, e.target.value)}
                      className="min-h-[60px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Esta promoción se mostrará a los usuarios cuando busquen canchas con Full Vaso
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFieldDetails(field)}
                >
                  Ver Detalles
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowEditPrice(field);
                    setEditPriceData({
                      basePrice: field.price.toString(),
                      weekendExtra: '10',
                      nightExtra: '5',
                      promoDescription: field.fullVasoPromo
                    });
                  }}
                >
                  Editar Precio
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-[#047857] border-[#047857]"
                  onClick={() => {
                    setSelectedField(field.name);
                    setShowFulVaso(true);
                  }}
                >
                  <ShoppingBag size={14} className="mr-1" />
                  FulVaso
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-[#047857] border-[#047857]"
                  onClick={() => {
                    setSelectedField(field.name);
                    setShowPromotions(true);
                  }}
                >
                  <TrendingUp size={14} className="mr-1" />
                  Promociones
                </Button>
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {/* Add Field Modal - Multi-step */}
      {showAddField && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <div>
                <h2>Agregar Nueva Cancha</h2>
                <p className="text-sm text-muted-foreground">Paso {currentStep} de 4</p>
              </div>
              <button onClick={() => {
                setShowAddField(false);
                setCurrentStep(1);
              }} className="p-2 hover:bg-muted rounded-full">
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
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fieldName">Nombre de la Cancha *</Label>
                    <Input
                      id="fieldName"
                      placeholder="Ej: Cancha Principal"
                      className="h-12"
                      value={newField.name}
                      onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="fieldAddress">Dirección *</Label>
                    <Input
                      id="fieldAddress"
                      placeholder="Ej: Av. Javier Prado 1234, San Isidro"
                      className="h-12"
                      value={newField.address}
                      onChange={(e) => setNewField({ ...newField, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="fieldType">Tipo de Cancha *</Label>
                    <Select value={newField.type} onValueChange={(value: string) => setNewField({ ...newField, type: value })}>
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
                    <Select value={newField.surface} onValueChange={(value: string) => setNewField({ ...newField, surface: value })}>
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
                      onChange={(e) => setNewField({ ...newField, maxCapacity: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Pricing */}
              {currentStep === 2 && (
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
                        onChange={(e) => setNewField({ ...newField, basePrice: e.target.value })}
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
              )}

              {/* Step 3: Services & Images */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label>Servicios Disponibles</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Selecciona los servicios que ofrece esta cancha
                    </p>
                    
                    <div className="space-y-3">
                      {[
                        { id: 'floodlights', name: 'Iluminación', icon: Lightbulb },
                        { id: 'changing', name: 'Vestuarios', icon: Shirt },
                        { id: 'parking', name: 'Estacionamiento', icon: Car },
                        { id: 'wifi', name: 'WiFi', icon: Wifi }
                      ].map((service) => {
                        const Icon = service.icon;
                        return (
                          <div key={service.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                            <Checkbox
                              id={service.id}
                              checked={newField.amenities.includes(service.id)}
                              onCheckedChange={() => toggleAmenity(service.id)}
                            />
                            <Label htmlFor={service.id} className="flex items-center gap-2 cursor-pointer flex-1">
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
                      onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Review & Publish */}
              {currentStep === 4 && (
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
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                >
                  <ChevronLeft size={16} className="mr-2" />
                  Anterior
                </Button>
              )}
              <Button
                className="flex-1 bg-[#047857] hover:bg-[#047857]/90"
                onClick={handleAddField}
              >
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
      )}

      {/* Bulk Edit Modal */}
      {showBulkEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <h2>Edición Masiva</h2>
              <button onClick={() => {
                setShowBulkEdit(false);
                setSelectedFieldsForBulk([]);
              }} className="p-2 hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <Label>Selecciona Canchas</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Marca las canchas que deseas modificar
                </p>
                <div className="space-y-2">
                  {fieldsData.map((field) => (
                    <div key={field.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <Checkbox
                        id={`bulk-${field.id}`}
                        checked={selectedFieldsForBulk.includes(field.id)}
                        onCheckedChange={(checked: boolean) => {
                          setSelectedFieldsForBulk(prev =>
                            checked
                              ? [...prev, field.id]
                              : prev.filter(id => id !== field.id)
                          );
                        }}
                      />
                      <Label htmlFor={`bulk-${field.id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span>{field.name}</span>
                          <span className="text-sm text-muted-foreground">S/ {field.price}/h</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {selectedFieldsForBulk.length > 0 && (
                <>
                  <div className="bg-secondary rounded-lg p-3">
                    <p className="text-sm">
                      <strong>{selectedFieldsForBulk.length}</strong> canchas seleccionadas
                    </p>
                  </div>

                  <div>
                    <Label>Ajustar Precio</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <Select
                        value={bulkEditData.adjustmentType}
                        onValueChange={(value: 'percentage' | 'fixed') =>
                          setBulkEditData({ ...bulkEditData, adjustmentType: value })
                        }
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                          <SelectItem value="fixed">Monto Fijo (S/)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder={bulkEditData.adjustmentType === 'percentage' ? '±10' : '±5.00'}
                        className="h-12"
                        value={bulkEditData.priceAdjustment}
                        onChange={(e) => setBulkEditData({ ...bulkEditData, priceAdjustment: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Usa números positivos para aumentar y negativos para reducir
                    </p>
                  </div>

                  <div>
                    <Label>Cambiar Estado</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <Button variant="outline" className="h-12">
                        Activar
                      </Button>
                      <Button variant="outline" className="h-12">
                        Mantenimiento
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowBulkEdit(false);
                  setSelectedFieldsForBulk([]);
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#047857] hover:bg-[#047857]/90"
                onClick={handleBulkEdit}
                disabled={selectedFieldsForBulk.length === 0}
              >
                Aplicar Cambios
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Availability Modal */}
      {showAvailability && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <h2>Configurar Disponibilidad</h2>
              <button onClick={() => setShowAvailability(false)} className="p-2 hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Calendar View */}
              <div>
                <Label>Calendario de Bloqueos</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecciona fechas para gestionar disponibilidad
                </p>
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4>Octubre 2025</h4>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <ChevronLeft size={16} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center text-sm">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                      <div key={day} className="text-muted-foreground py-2">{day}</div>
                    ))}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <button
                        key={day}
                        className={`py-2 rounded-lg hover:bg-muted ${
                          day === 15 ? 'bg-[#047857] text-white' : ''
                        } ${day === 20 || day === 25 ? 'bg-red-100 text-red-600' : ''}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time Blocking */}
              <div>
                <Label>Bloquear Período</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Define horarios no disponibles para la fecha seleccionada
                </p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="blockStart" className="text-sm">Desde</Label>
                      <Input id="blockStart" type="time" className="h-12" />
                    </div>
                    <div>
                      <Label htmlFor="blockEnd" className="text-sm">Hasta</Label>
                      <Input id="blockEnd" type="time" className="h-12" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="blockReason">Motivo del Bloqueo</Label>
                    <Select>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Seleccionar motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                        <SelectItem value="uso_personal">Uso Personal</SelectItem>
                        <SelectItem value="evento_privado">Evento Privado</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-[#047857] hover:bg-[#047857]/90">
                    Aplicar Bloqueo
                  </Button>
                </div>
              </div>

              {/* Opening Hours */}
              <div>
                <Label>Horario Fijo de Operación</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Define el horario general de apertura y cierre
                </p>
                <div className="space-y-3">
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                    <div key={day} className="flex items-center gap-3">
                      <span className="w-24 text-sm">{day}</span>
                      <Input type="time" defaultValue="08:00" className="h-10" />
                      <span className="text-muted-foreground">-</span>
                      <Input type="time" defaultValue="23:00" className="h-10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-border p-4">
              <Button
                className="w-full bg-[#047857] hover:bg-[#047857]/90"
                onClick={() => setShowAvailability(false)}
              >
                Guardar Configuración
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Field Details Modal */}
      {showFieldDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <h2>Detalles de Cancha</h2>
              <button onClick={() => setShowFieldDetails(null)} className="p-2 hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image */}
              <div className="relative h-48">
                <ImageWithFallback
                  src={showFieldDetails.images[0]}
                  alt={showFieldDetails.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 space-y-4">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3>{showFieldDetails.name}</h3>
                    <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                      {showFieldDetails.status === 'active' ? 'Activa' : 'Mantenimiento'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star size={14} fill="#facc15" className="text-[#facc15]" />
                      <span>{showFieldDetails.rating}</span>
                    </div>
                    <span>{showFieldDetails.capacity}</span>
                    <span>{showFieldDetails.surface}</span>
                  </div>
                </div>

                {/* Public Info */}
                <div>
                  <h4 className="mb-2">Información Pública</h4>
                  <p className="text-sm text-muted-foreground">{showFieldDetails.description}</p>
                </div>

                {/* Services */}
                <div>
                  <h4 className="mb-2">Servicios</h4>
                  <div className="flex flex-wrap gap-2">
                    {showFieldDetails.amenities.map((amenity) => {
                      const Icon = amenityIcons[amenity];
                      return (
                        <div
                          key={amenity}
                          className="flex items-center gap-1 px-3 py-2 bg-muted rounded-lg text-sm"
                        >
                          <Icon size={14} />
                          <span>{amenityNames[amenity]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Internal Metrics */}
                <div className="bg-secondary rounded-lg p-4">
                  <h4 className="mb-3">Métricas Internas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Ingreso Total</p>
                      <p className="text-lg text-[#047857]">S/ {showFieldDetails.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Ocupación Promedio</p>
                      <p className="text-lg text-[#047857]">{showFieldDetails.occupancyRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Precio Base</p>
                      <p className="text-lg">S/ {showFieldDetails.price}/h</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Reservas Totales</p>
                      <p className="text-lg">{showFieldDetails.bookings}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-border p-4">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowFieldDetails(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Price Modal */}
      {showEditPrice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <div>
                <h2>Editar Precio</h2>
                <p className="text-sm text-muted-foreground">{showEditPrice.name}</p>
              </div>
              <button onClick={() => setShowEditPrice(null)} className="p-2 hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="editBasePrice">Precio Base por Hora *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">S/</span>
                  <Input
                    id="editBasePrice"
                    type="number"
                    placeholder="50.00"
                    className="h-12 pl-10"
                    value={editPriceData.basePrice}
                    onChange={(e) => setEditPriceData({ ...editPriceData, basePrice: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Tarifas Especiales</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Define precios adicionales para períodos específicos
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm">Fin de Semana</p>
                      <p className="text-xs text-muted-foreground">Sábado y Domingo</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked />
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">+S/</span>
                        <Input
                          type="number"
                          placeholder="10"
                          className="h-10 pl-10"
                          value={editPriceData.weekendExtra}
                          onChange={(e) => setEditPriceData({ ...editPriceData, weekendExtra: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm">Horario Nocturno</p>
                      <p className="text-xs text-muted-foreground">19:00 - 23:00</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked />
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">+S/</span>
                        <Input
                          type="number"
                          placeholder="5"
                          className="h-10 pl-10"
                          value={editPriceData.nightExtra}
                          onChange={(e) => setEditPriceData({ ...editPriceData, nightExtra: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {showEditPrice.hasFullVaso && (
                <div>
                  <Label htmlFor="editPromoDesc">Promoción Full Vaso</Label>
                  <Textarea
                    id="editPromoDesc"
                    placeholder="Descripción de la promoción Full Vaso"
                    className="min-h-24"
                    value={editPriceData.promoDescription}
                    onChange={(e) => setEditPriceData({ ...editPriceData, promoDescription: e.target.value })}
                  />
                </div>
              )}

              <div className="bg-secondary rounded-lg p-4">
                <h4 className="mb-2">Vista Previa de Precios</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio Base:</span>
                    <span>S/ {editPriceData.basePrice || '0'}/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fin de Semana:</span>
                    <span>S/ {(Number(editPriceData.basePrice) + Number(editPriceData.weekendExtra || 0)) || '0'}/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Noche:</span>
                    <span>S/ {(Number(editPriceData.basePrice) + Number(editPriceData.nightExtra || 0)) || '0'}/h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEditPrice(null)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#047857] hover:bg-[#047857]/90"
                disabled={saving}
                onClick={() => {
                  if (showEditPrice) {
                    handleUpdateField(showEditPrice.id, {
                      basePricePerHour: parseFloat(editPriceData.basePrice) || showEditPrice.price
                    });
                  }
                }}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cancha?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar "{showDeleteConfirm?.name}"? 
              Esta acción marcará la cancha como inactiva. El historial de reservas se conservará.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={saving}
              onClick={() => {
                if (showDeleteConfirm) {
                  handleDeleteField(showDeleteConfirm.id);
                }
              }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
