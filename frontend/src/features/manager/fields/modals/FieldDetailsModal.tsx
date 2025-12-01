import { X, Star } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { ImageWithFallback } from "../../../../components/figma/ImageWithFallback";
import { AmenitiesList } from "../components/AmenitiesList";
import { FieldDisplay } from "../types";

interface FieldDetailsModalProps {
  field: FieldDisplay | null;
  onClose: () => void;
}

export function FieldDetailsModal({ field, onClose }: FieldDetailsModalProps) {
  if (!field) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
          <h2>Detalles de Cancha</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Image */}
          <div className="relative h-48">
            <ImageWithFallback
              src={field.images[0]}
              alt={field.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-4 space-y-4">
            {/* Header Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3>{field.name}</h3>
                <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                  {field.status === 'active' ? 'Activa' : 'Mantenimiento'}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star size={14} fill="#facc15" className="text-[#facc15]" />
                  <span>{field.rating}</span>
                </div>
                <span>{field.capacity}</span>
                <span>{field.surface}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="mb-2">Información Pública</h4>
              <p className="text-sm text-muted-foreground">
                {field.description || 'Sin descripción'}
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="mb-2">Servicios</h4>
              <AmenitiesList amenities={field.amenities} size="md" />
            </div>

            {/* Internal Metrics */}
            <div className="bg-secondary rounded-lg p-4">
              <h4 className="mb-3">Métricas Internas</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ingreso Total</p>
                  <p className="text-lg text-[#047857]">S/ {field.totalRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ocupación Promedio</p>
                  <p className="text-lg text-[#047857]">{field.occupancyRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Precio Base</p>
                  <p className="text-lg">S/ {field.price}/h</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reservas Totales</p>
                  <p className="text-lg">{field.bookings}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border p-4">
          <Button
            className="w-full"
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
