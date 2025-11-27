import { useState } from "react";
import { TrendingUp, Check, CreditCard, Calendar, X, Plus, Percent, Gift, Clock, Tag } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const plans = [
  {
    id: 'daily',
    name: 'Impulso Diario',
    duration: '1 Día',
    price: 25,
    popular: false,
    benefits: [
      'Destacado en pantalla principal',
      'Aparece en primeras posiciones',
      'Badge "Destacado" visible',
      '24 horas de visibilidad'
    ]
  },
  {
    id: 'weekly',
    name: 'Impulso Semanal',
    duration: '7 Días',
    price: 120,
    popular: true,
    benefits: [
      'Destacado en pantalla principal',
      'Aparece en primeras posiciones',
      'Badge "Destacado" visible',
      '7 días completos de visibilidad',
      'Prioridad en búsquedas',
      'Ahorra S/ 55 vs plan diario'
    ]
  },
  {
    id: 'monthly',
    name: 'Impulso Mensual',
    duration: '30 Días',
    price: 465,
    popular: false,
    benefits: [
      'Destacado en pantalla principal',
      'Aparece en primeras posiciones',
      'Badge "Destacado" visible',
      '30 días completos de visibilidad',
      'Prioridad máxima en búsquedas',
      'Ahorra S/ 285 vs plan diario',
      'Soporte prioritario'
    ]
  }
];

const activeCampaigns = [
  {
    id: 1,
    fieldName: 'Canchita La Merced',
    plan: 'Impulso Semanal',
    startDate: '2025-10-05',
    endDate: '2025-10-12',
    daysRemaining: 3,
    status: 'active'
  }
];

const fields = [
  { id: '1', name: 'Canchita La Merced', type: '7v7' },
  { id: '2', name: 'Estadio Zona Sur', type: '11v11' },
  { id: '3', name: 'Cancha Los Pinos', type: '5v5' }
];

interface Promotion {
  id: number;
  type: 'discount' | '2x1' | 'happyhour';
  name: string;
  description: string;
  value: string;
  field: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

const mockPromotions: Promotion[] = [
  {
    id: 1,
    type: 'discount',
    name: '10% OFF',
    description: 'Descuento en Cancha Principal',
    value: '10%',
    field: 'Canchita La Merced',
    startDate: '2025-10-01',
    endDate: '2025-10-31',
    status: 'active'
  },
  {
    id: 2,
    type: 'happyhour',
    name: 'Happy Hour',
    description: '20% OFF de 2pm a 4pm',
    value: '20%',
    field: 'Estadio Zona Sur',
    startDate: '2025-10-15',
    endDate: '2025-11-15',
    status: 'active'
  }
];

export function AdvertisingScreen() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [showCreatePromotion, setShowCreatePromotion] = useState(false);
  const [showEditPromotion, setShowEditPromotion] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);

  // New promotion state
  const [newPromotion, setNewPromotion] = useState({
    type: 'discount' as 'discount' | '2x1' | 'happyhour',
    name: '',
    description: '',
    value: '',
    field: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined
  });

  const handleSelectPlan = (plan: typeof plans[0]) => {
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
      status: 'active'
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
      endDate: new Date(promo.endDate)
    });
    setShowEditPromotion(true);
  };

  const handleUpdatePromotion = () => {
    if (!selectedPromotion) return;

    const updatedPromotions = promotions.map(p => 
      p.id === selectedPromotion.id 
        ? {
            ...p,
            type: newPromotion.type,
            name: newPromotion.name,
            description: newPromotion.description,
            value: newPromotion.value,
            field: newPromotion.field,
            startDate: newPromotion.startDate?.toISOString() || '',
            endDate: newPromotion.endDate?.toISOString() || ''
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

    const updatedPromotions = promotions.map(p => 
      p.id === selectedPromotion.id 
        ? { ...p, status: 'inactive' as const }
        : p
    );

    setPromotions(updatedPromotions);
    alert('Promoción desactivada exitosamente');
    setShowDeactivateDialog(false);
    setSelectedPromotion(null);
  };

  const handleActivatePromotion = (promo: Promotion) => {
    const updatedPromotions = promotions.map(p => 
      p.id === promo.id 
        ? { ...p, status: 'active' as const }
        : p
    );

    setPromotions(updatedPromotions);
    alert('Promoción activada exitosamente');
  };

  const handleDeletePromotion = () => {
    if (!selectedPromotion) return;

    const updatedPromotions = promotions.filter(p => p.id !== selectedPromotion.id);
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

  const resetPromotionForm = () => {
    setNewPromotion({
      type: 'discount',
      name: '',
      description: '',
      value: '',
      field: '',
      startDate: undefined,
      endDate: undefined
    });
  };

  const getPromotionIcon = (type: string, isInactive: boolean = false) => {
    const colorClass = isInactive ? "text-gray-400" : "text-[#047857]";
    switch (type) {
      case 'discount': return <Percent size={20} className={colorClass} />;
      case '2x1': return <Gift size={20} className={colorClass} />;
      case 'happyhour': return <Clock size={20} className={colorClass} />;
      default: return <Tag size={20} className={colorClass} />;
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl mb-2">Planes de Visibilidad</h1>
          <p className="text-muted-foreground">
            Destaca tu cancha en la pantalla principal de Fulbo y aumenta tus reservas
          </p>
        </div>

        {/* Active Campaigns */}
        {activeCampaigns.length > 0 && (
          <div>
            <h3 className="mb-3">Campañas Activas</h3>
            <div className="space-y-3">
              {activeCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-secondary border-2 border-[#047857] rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4>{campaign.fieldName}</h4>
                      <p className="text-sm text-muted-foreground">{campaign.plan}</p>
                    </div>
                    <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                      Activa
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Inicio</p>
                      <p className="text-sm">{new Date(campaign.startDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Fin</p>
                      <p className="text-sm">{new Date(campaign.endDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Quedan</p>
                      <p className="text-sm text-[#047857]">{campaign.daysRemaining}d</p>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setShowRenewDialog(true)}
                  >
                    Renovar Campaña
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plans */}
        <div>
          <h3 className="mb-4">Planes Disponibles</h3>
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl p-5 border-2 relative ${
                  plan.popular
                    ? 'border-[#047857] bg-secondary'
                    : 'border-border bg-white'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-4 bg-[#047857] hover:bg-[#047857]/90 text-white border-none">
                    <TrendingUp size={12} className="mr-1" />
                    Más Popular
                  </Badge>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="mb-1">{plan.name}</h4>
                    <p className="text-sm text-muted-foreground">{plan.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl text-[#047857]">S/ {plan.price}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {plan.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-[#047857] mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-[#047857] hover:bg-[#047857]/90'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  Comprar Plan
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Promotions Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3>Promociones Personalizadas</h3>
              <p className="text-sm text-muted-foreground">Crea ofertas especiales para tus canchas</p>
            </div>
            <button
              onClick={() => setShowCreatePromotion(true)}
              className="w-10 h-10 bg-[#047857] hover:bg-[#047857]/90 rounded-full flex items-center justify-center text-white"
            >
              <Plus size={20} />
            </button>
          </div>

          {promotions.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Tag size={48} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Aún no tienes promociones activas
              </p>
              <Button
                onClick={() => setShowCreatePromotion(true)}
                className="bg-[#047857] hover:bg-[#047857]/90"
              >
                <Plus size={18} className="mr-2" />
                Crear Primera Promoción
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {promotions.map((promo) => (
                <div 
                  key={promo.id} 
                  className={`rounded-xl p-4 ${
                    promo.status === 'active' 
                      ? 'border border-border bg-white' 
                      : 'border border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        promo.status === 'active' ? 'bg-secondary' : 'bg-gray-200'
                      }`}>
                        {getPromotionIcon(promo.type, promo.status === 'inactive')}
                      </div>
                      <div>
                        <h4 className={`mb-1 ${promo.status === 'inactive' ? 'text-gray-600' : ''}`}>{promo.name}</h4>
                        <p className="text-sm text-muted-foreground">{promo.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{promo.field}</p>
                      </div>
                    </div>
                    <Badge className={promo.status === 'active' ? 'bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none' : 'bg-gray-400 hover:bg-gray-400/90 text-white border-none'}>
                      {promo.status === 'active' ? 'Activa' : 'Pausada'}
                    </Badge>
                  </div>

                  <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar size={14} className="mt-0.5" />
                    <span>
                      {new Date(promo.startDate).toLocaleDateString('es-PE')} - {new Date(promo.endDate).toLocaleDateString('es-PE')}
                    </span>
                  </div>

                  {promo.status === 'active' ? (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditPromotion(promo)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-destructive hover:bg-destructive/10"
                        onClick={() => openDeactivateDialog(promo)}
                      >
                        Desactivar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditPromotion(promo)}
                      >
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-[#047857] hover:bg-[#047857]/90 text-white"
                        onClick={() => handleActivatePromotion(promo)}
                      >
                        Activar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-destructive hover:bg-destructive/10 border-destructive"
                        onClick={() => openDeleteDialog(promo)}
                      >
                        Borrar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Renew Campaign Dialog */}
      <Dialog open={showRenewDialog} onOpenChange={setShowRenewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renovar Campaña</DialogTitle>
            <DialogDescription>
              Renueva tu campaña actual con el mismo plan o elige uno nuevo
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Plan Actual</p>
              <p className="mb-1">Impulso Semanal</p>
              <p className="text-2xl text-[#047857]">S/ 120</p>
            </div>

            <div className="space-y-2">
              <Label>O elige un nuevo plan</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plan..." />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - S/ {plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenewDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRenewCampaign} className="bg-[#047857] hover:bg-[#047857]/90">
              Renovar con Mismo Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Promotion Dialog */}
      <Dialog open={showCreatePromotion || showEditPromotion} onOpenChange={(open: boolean) => {
        if (!open) {
          setShowCreatePromotion(false);
          setShowEditPromotion(false);
          setSelectedPromotion(null);
          resetPromotionForm();
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showEditPromotion ? 'Editar Promoción' : 'Crear Nueva Promoción'}</DialogTitle>
            <DialogDescription>
              {showEditPromotion ? 'Actualiza los detalles de la promoción' : 'Configura una oferta especial para atraer más clientes'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Promoción *</Label>
              <Select value={newPromotion.type} onValueChange={(value: string) => setNewPromotion({ ...newPromotion, type: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">
                    <div className="flex items-center gap-2">
                      <Percent size={16} />
                      <span>Descuento Porcentual</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="2x1">
                    <div className="flex items-center gap-2">
                      <Gift size={16} />
                      <span>2x1 en Reservas</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="happyhour">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>Happy Hour (Horas Específicas)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nombre de la Promoción *</Label>
              <Input
                value={newPromotion.name}
                onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })}
                placeholder="Ej: 10% OFF"
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción *</Label>
              <Textarea
                value={newPromotion.description}
                onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
                placeholder="Describe los detalles de la promoción"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor del Descuento *</Label>
              <div className="flex gap-2">
                <Input
                  value={newPromotion.value}
                  onChange={(e) => setNewPromotion({ ...newPromotion, value: e.target.value })}
                  placeholder="10"
                  type="number"
                  className="flex-1"
                />
                <div className="w-16 h-10 bg-muted rounded-lg flex items-center justify-center">
                  {newPromotion.type === '2x1' ? '2x1' : '%'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cancha Aplicable *</Label>
              <Select value={newPromotion.field} onValueChange={(value: string) => setNewPromotion({ ...newPromotion, field: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cancha..." />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.name}>
                      {field.name} ({field.type})
                    </SelectItem>
                  ))}
                  <SelectItem value="all">Todas las canchas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Fecha de Inicio *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <Calendar size={16} className="mr-2" />
                      {newPromotion.startDate ? format(newPromotion.startDate, "d MMM", { locale: es }) : "Elegir"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={newPromotion.startDate}
                      onSelect={(date: Date) => setNewPromotion({ ...newPromotion, startDate: date })}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Fecha de Fin *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <Calendar size={16} className="mr-2" />
                      {newPromotion.endDate ? format(newPromotion.endDate, "d MMM", { locale: es }) : "Elegir"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={newPromotion.endDate}
                      onSelect={(date: Date) => setNewPromotion({ ...newPromotion, endDate: date })}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreatePromotion(false);
              setShowEditPromotion(false);
              setSelectedPromotion(null);
              resetPromotionForm();
            }}>
              Cancelar
            </Button>
            <Button
              onClick={showEditPromotion ? handleUpdatePromotion : handleCreatePromotion}
              className="bg-[#047857] hover:bg-[#047857]/90"
              disabled={!newPromotion.name || !newPromotion.description || !newPromotion.value || !newPromotion.field || !newPromotion.startDate || !newPromotion.endDate}
            >
              {showEditPromotion ? 'Guardar Cambios' : 'Publicar Promoción'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Promotion Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar promoción?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas desactivar la promoción "{selectedPromotion?.name}"? Se pausará y dejará de ser visible para los usuarios, pero podrás reactivarla más tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeactivatePromotion}
              className="bg-destructive hover:bg-destructive/90"
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Promotion Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar promoción permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmas la eliminación permanente de la promoción "{selectedPromotion?.name}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePromotion}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <h2>Finalizar Compra</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Plan Summary */}
              <div className="bg-secondary rounded-xl p-4">
                <h3 className="mb-3">Resumen del Plan</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span>{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duración:</span>
                    <span>{selectedPlan.duration}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span>Total:</span>
                    <span className="text-xl text-[#047857]">S/ {selectedPlan.price}</span>
                  </div>
                </div>
              </div>

              {/* Field Selection */}
              <div>
                <Label className="mb-2">Cancha a promocionar</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cancha..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.id} value={field.name}>
                        {field.name} ({field.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="mb-3">Método de Pago</h3>
                <div className="space-y-3">
                  <button className="w-full p-4 border-2 border-[#047857] bg-secondary rounded-xl flex items-center gap-3">
                    <CreditCard className="text-[#047857]" />
                    <div className="text-left">
                      <p>Tarjeta de Crédito/Débito</p>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard, etc.</p>
                    </div>
                  </button>
                  
                  <button className="w-full p-4 border border-border rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs">Y</span>
                    </div>
                    <div className="text-left">
                      <p>Yape / Plin</p>
                      <p className="text-sm text-muted-foreground">Billetera digital</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Card Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    className="h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Vencimiento</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/AA"
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      className="h-12"
                      type="password"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
                  <Input
                    id="cardName"
                    placeholder="Juan Pérez"
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-border p-4">
              <Button
                className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
                onClick={handlePayment}
              >
                Confirmar Pago - S/ {selectedPlan.price}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
