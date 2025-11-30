import { Percent, DollarSign, Calendar, Edit2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import type { Promotion, PromotionDiscountType } from "../types";

interface PromotionCardProps {
  promotion: Promotion;
  onEdit: (promotion: Promotion) => void;
  onDeactivate: (promotion: Promotion) => void;
}

function PromoTypeIcon({ type }: { type: PromotionDiscountType }) {
  switch (type) {
    case 'percentage':
      return <Percent size={18} className="text-[#047857]" />;
    case 'fixed_amount':
      return <DollarSign size={18} className="text-[#047857]" />;
    default:
      return <Percent size={18} className="text-[#047857]" />;
  }
}

export function PromotionCard({ promotion, onEdit, onDeactivate }: PromotionCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
          <PromoTypeIcon type={promotion.discountType} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4>{promotion.title}</h4>
            <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
              Activa
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{promotion.description}</p>
          <p className="text-[#047857] font-medium mt-1">
            {promotion.discountType === 'percentage'
              ? `${promotion.discountValue}% de descuento`
              : `S/ ${promotion.discountValue} de descuento`
            }
          </p>
        </div>
      </div>

      <div className="bg-muted rounded-lg p-3 mb-3">
        <p className="text-xs text-muted-foreground mb-1">Período de vigencia</p>
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} />
          <span>{formatDate(promotion.startDate)}</span>
          <span>-</span>
          <span>{formatDate(promotion.endDate)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onEdit(promotion)}
        >
          <Edit2 size={14} className="mr-2" />
          Editar
        </Button>
        <Button
          variant="outline"
          className="flex-1 text-red-500 hover:bg-red-50 border-red-200"
          onClick={() => onDeactivate(promotion)}
        >
          Desactivar
        </Button>
      </div>
    </div>
  );
}

interface InactivePromotionCardProps {
  promotion: Promotion;
}

export function InactivePromotionCard({ promotion }: InactivePromotionCardProps) {
  return (
    <div className="bg-muted/50 border border-border rounded-xl p-4 opacity-60">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
          <PromoTypeIcon type={promotion.discountType} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4>{promotion.title}</h4>
            <Badge variant="secondary" className="bg-gray-200">
              Inactiva
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{promotion.description}</p>
        </div>
      </div>
    </div>
  );
}
