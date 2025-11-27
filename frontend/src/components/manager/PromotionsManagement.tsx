import { useState } from "react";
import { ArrowLeft, Plus, Edit2, X, Upload, Calendar, Percent, DollarSign, Tag } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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

interface PromotionsManagementProps {
  fieldName: string;
  onBack: () => void;
}

interface Promotion {
  id: number;
  title: string;
  description: string;
  type: string;
  value: string;
  startDate: string;
  endDate: string;
  image: string;
  status: 'active' | 'inactive';
  applicableFields: string[];
}

const initialPromotions: Promotion[] = [
  {
    id: 1,
    title: '10% OFF',
    description: 'Descuento en Cancha Principal',
    type: 'percentage',
    value: '10',
    startDate: '2025-09-30',
    endDate: '2025-10-30',
    image: 'https://images.unsplash.com/photo-1641029185333-7ed62a19d5f0?w=800',
    status: 'active',
    applicableFields: ['Cancha Principal']
  },
  {
    id: 2,
    title: 'Happy Hour',
    description: '20% OFF de 2pm a 4pm',
    type: 'percentage',
    value: '20',
    startDate: '2025-10-14',
    endDate: '2025-11-14',
    image: 'https://images.unsplash.com/photo-1680537732560-7dd5f9b1ed53?w=800',
    status: 'active',
    applicableFields: ['Estadio Zona Sur']
  }
];

export function PromotionsManagement({ fieldName, onBack }: PromotionsManagementProps) {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [showCreatePromotion, setShowCreatePromotion] = useState(false);
  const [showEditPromotion, setShowEditPromotion] = useState<Promotion | null>(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState<Promotion | null>(null);
  
  const [newPromotion, setNewPromotion] = useState({
    title: '',
    description: '',
    type: 'percentage',
    value: '',
    startDate: '',
    endDate: '',
    image: '',
    applicableFields: [] as string[]
  });

  const handleCreatePromotion = () => {
    const promotion: Promotion = {
      id: promotions.length + 1,
      ...newPromotion,
      status: 'active'
    };
    setPromotions([...promotions, promotion]);
    setShowCreatePromotion(false);
    setNewPromotion({ 
      title: '', 
      description: '', 
      type: 'percentage',
      value: '',
      startDate: '', 
      endDate: '', 
      image: '',
      applicableFields: []
    });
  };

  const handleEditPromotion = () => {
    if (!showEditPromotion) return;
    
    setPromotions(prev => prev.map(promo => 
      promo.id === showEditPromotion.id ? showEditPromotion : promo
    ));
    setShowEditPromotion(null);
  };

  const handleDeactivatePromotion = () => {
    if (!showDeactivateDialog) return;
    
    setPromotions(prev => prev.map(promo => 
      promo.id === showDeactivateDialog.id 
        ? { ...promo, status: 'inactive' as const }
        : promo
    ));
    setShowDeactivateDialog(null);
  };

  const PromoTypeIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'percentage':
        return <Percent size={18} className="text-[#047857]" />;
      case 'fixed':
        return <DollarSign size={18} className="text-[#047857]" />;
      case '2x1':
        return <Tag size={18} className="text-[#047857]" />;
      default:
        return <Percent size={18} className="text-[#047857]" />;
    }
  };

  const renderPromotionForm = (
    data: typeof newPromotion | Promotion,
    setData: (data: any) => void,
    isEdit: boolean = false
  ) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="promoTitle">Título de la Promoción *</Label>
        <Input
          id="promoTitle"
          placeholder="Ej: 10% OFF, 2x1 los Martes"
          className="h-12"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="promoType">Tipo de Promoción *</Label>
        <Select 
          value={data.type} 
          onValueChange={(value: string) => setData({ ...data, type: value })}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">
              <div className="flex items-center gap-2">
                <Percent size={14} />
                <span>Descuento Porcentual (%)</span>
              </div>
            </SelectItem>
            <SelectItem value="fixed">
              <div className="flex items-center gap-2">
                <DollarSign size={14} />
                <span>Monto Fijo (S/)</span>
              </div>
            </SelectItem>
            <SelectItem value="2x1">
              <div className="flex items-center gap-2">
                <Tag size={14} />
                <span>2x1 - Paga 1 Lleva 2</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.type !== '2x1' && (
        <div>
          <Label htmlFor="promoValue">Valor de la Promoción *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {data.type === 'percentage' ? '%' : 'S/'}
            </span>
            <Input
              id="promoValue"
              type="number"
              placeholder={data.type === 'percentage' ? '10' : '15.00'}
              className="h-12 pl-10"
              value={data.value}
              onChange={(e) => setData({ ...data, value: e.target.value })}
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="promoDescription">Descripción *</Label>
        <Textarea
          id="promoDescription"
          placeholder="Describe los detalles de la promoción"
          className="min-h-24"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Fecha de Inicio *</Label>
          <Input
            id="startDate"
            type="date"
            className="h-12"
            value={data.startDate}
            onChange={(e) => setData({ ...data, startDate: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="endDate">Fecha de Fin *</Label>
          <Input
            id="endDate"
            type="date"
            className="h-12"
            value={data.endDate}
            onChange={(e) => setData({ ...data, endDate: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>Canchas Aplicables</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Selecciona en qué canchas aplicará esta promoción
        </p>
        <Select>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Seleccionar canchas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las canchas</SelectItem>
            <SelectItem value="cancha1">Cancha Principal</SelectItem>
            <SelectItem value="cancha2">Cancha 2</SelectItem>
            <SelectItem value="cancha3">Cancha Interior</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Imagen de la Promoción</Label>
        <p className="text-xs text-muted-foreground mb-2">Esta imagen aparecerá en el carrusel principal de Fulbo</p>
        <div className="mt-2 border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-[#047857] transition-colors">
          <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Haz clic para subir una imagen</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG - Recomendado 1200x400px</p>
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-3">
        <p className="text-sm">
          <strong>Nota:</strong> Las promociones aparecerán automáticamente en el home de todos los usuarios de Fulbo durante las fechas seleccionadas.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2>Promociones Personalizadas</h2>
          <p className="text-sm text-muted-foreground">Crea ofertas especiales para tus canchas</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Create Button */}
        <Button
          className="w-full bg-[#047857] hover:bg-[#047857]/90"
          onClick={() => setShowCreatePromotion(true)}
        >
          <Plus size={16} className="mr-2" />
          Crear Nueva Promoción
        </Button>

        {/* Info Box */}
        <div className="bg-secondary rounded-xl p-4 border border-[#047857]">
          <h4 className="mb-2">💡 Tip: Aumenta tus reservas</h4>
          <p className="text-sm text-muted-foreground">
            Las promociones aparecerán en el carrusel principal de Fulbo, visible para todos los usuarios.
          </p>
        </div>

        {/* Active Promotions */}
        <div>
          <h3 className="mb-4">Promociones Activas</h3>
          <div className="space-y-4">
            {promotions
              .filter(p => p.status === 'active')
              .map((promo) => (
                <div
                  key={promo.id}
                  className="bg-white border border-border rounded-xl overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-40">
                    <ImageWithFallback
                      src={promo.image}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-3 right-3 bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                      Activa
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <PromoTypeIcon type={promo.type} />
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-1">{promo.title}</h4>
                        <p className="text-sm text-muted-foreground">{promo.description}</p>
                      </div>
                    </div>

                    <div className="bg-muted rounded-lg p-3 mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Período de vigencia</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} />
                        <span>{new Date(promo.startDate).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        <span>-</span>
                        <span>{new Date(promo.endDate).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Canchas: <span className="text-foreground">{promo.applicableFields.join(', ')}</span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowEditPromotion(promo)}
                      >
                        <Edit2 size={14} className="mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 text-red-500 hover:bg-red-50 border-red-200"
                        onClick={() => setShowDeactivateDialog(promo)}
                      >
                        Desactivar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Inactive Promotions */}
        {promotions.some(p => p.status === 'inactive') && (
          <div>
            <h3 className="mb-4">Promociones Inactivas</h3>
            <div className="space-y-3">
              {promotions
                .filter(p => p.status === 'inactive')
                .map((promo) => (
                  <div
                    key={promo.id}
                    className="bg-muted/50 border border-border rounded-xl p-4 opacity-60"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <PromoTypeIcon type={promo.type} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4>{promo.title}</h4>
                          <Badge variant="secondary" className="bg-gray-200">
                            Inactiva
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{promo.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Promotion Modal */}
      {showCreatePromotion && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <h2>Crear Promoción</h2>
              <button onClick={() => setShowCreatePromotion(false)} className="p-2 hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              {renderPromotionForm(newPromotion, setNewPromotion)}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreatePromotion(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#047857] hover:bg-[#047857]/90"
                onClick={handleCreatePromotion}
              >
                Crear Promoción
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Promotion Modal */}
      {showEditPromotion && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <h2>Editar Promoción</h2>
              <button onClick={() => setShowEditPromotion(null)} className="p-2 hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              {renderPromotionForm(showEditPromotion, setShowEditPromotion, true)}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEditPromotion(null)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#047857] hover:bg-[#047857]/90"
                onClick={handleEditPromotion}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={!!showDeactivateDialog} onOpenChange={(open: boolean) => !open && setShowDeactivateDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar Promoción?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Desea desactivar la promoción "{showDeactivateDialog?.title}"? 
              Ya no será visible para los usuarios y dejará de aplicarse a nuevas reservas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivatePromotion}
              className="bg-red-500 hover:bg-red-600"
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
