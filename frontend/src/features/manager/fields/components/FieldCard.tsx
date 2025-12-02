import { Star, MapPin, Wine, Trash2, ShoppingBag, TrendingUp } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Switch } from "../../../../components/ui/switch";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { AmenitiesList } from "./AmenitiesList";
import { FieldDisplay } from "../types";

interface FieldCardProps {
  field: FieldDisplay;
  onViewDetails: () => void;
  onEditPrice: () => void;
  onDelete: () => void;
  onFulVaso: () => void;
  onPromotions: () => void;
  onToggleFullVaso: () => void;
  onUpdateFullVasoPromo: (promo: string) => void;
}

export function FieldCard({
  field,
  onViewDetails,
  onEditPrice,
  onDelete,
  onFulVaso,
  onPromotions,
  onToggleFullVaso,
  onUpdateFullVasoPromo,
}: FieldCardProps) {
  return (
    <div className="border border-border rounded-lg p-4 space-y-4">
      {/* Header */}
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
              <span>{field.rating > 0 ? field.rating.toFixed(1) : '-'}</span>
              {field.reviewCount !== undefined && field.reviewCount > 0 && (
                <span className="text-xs text-gray-400">({field.reviewCount})</span>
              )}
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
            onClick={onDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Eliminar cancha"
          >
            <Trash2 size={18} />
          </button>
          <Switch checked={field.status === 'active'} />
        </div>
      </div>

      {/* Stats */}
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

      {/* Amenities */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Servicios</p>
        <AmenitiesList amenities={field.amenities} />
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
            onCheckedChange={onToggleFullVaso}
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
              onChange={(e) => onUpdateFullVasoPromo(e.target.value)}
              className="min-h-[60px]"
            />
            <p className="text-xs text-muted-foreground">
              Esta promoción se mostrará a los usuarios cuando busquen canchas con Full Vaso
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onViewDetails}
        >
          Ver Detalles
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onEditPrice}
        >
          Editar Precio
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="text-[#047857] border-[#047857]"
          onClick={onFulVaso}
        >
          <ShoppingBag size={14} className="mr-1" />
          FulVaso
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="text-[#047857] border-[#047857]"
          onClick={onPromotions}
        >
          <TrendingUp size={14} className="mr-1" />
          Promociones
        </Button>
      </div>
    </div>
  );
}
