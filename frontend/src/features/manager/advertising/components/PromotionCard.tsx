import { Percent, Gift, Clock, Tag, Calendar } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Promotion, formatFullDatePE } from '../types';

interface PromotionCardProps {
  promotion: Promotion;
  onEdit: (promo: Promotion) => void;
  onDeactivate: (promo: Promotion) => void;
  onActivate: (promo: Promotion) => void;
  onDelete: (promo: Promotion) => void;
}

function getPromotionIcon(type: string, isInactive: boolean = false) {
  const colorClass = isInactive ? 'text-gray-400' : 'text-[#047857]';
  switch (type) {
    case 'discount':
      return <Percent size={20} className={colorClass} />;
    case '2x1':
      return <Gift size={20} className={colorClass} />;
    case 'happyhour':
      return <Clock size={20} className={colorClass} />;
    default:
      return <Tag size={20} className={colorClass} />;
  }
}

export function PromotionCard({
  promotion,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
}: PromotionCardProps) {
  const isInactive = promotion.status === 'inactive';

  return (
    <div
      className={`rounded-xl p-4 ${
        isInactive ? 'border border-gray-300 bg-gray-50' : 'border border-border bg-white'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isInactive ? 'bg-gray-200' : 'bg-secondary'
            }`}
          >
            {getPromotionIcon(promotion.type, isInactive)}
          </div>
          <div>
            <h4 className={`mb-1 ${isInactive ? 'text-gray-600' : ''}`}>{promotion.name}</h4>
            <p className="text-sm text-muted-foreground">{promotion.description}</p>
            <p className="text-xs text-muted-foreground mt-1">{promotion.field}</p>
          </div>
        </div>
        <Badge
          className={
            isInactive
              ? 'bg-gray-400 hover:bg-gray-400/90 text-white border-none'
              : 'bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none'
          }
        >
          {isInactive ? 'Pausada' : 'Activa'}
        </Badge>
      </div>

      <div className="flex gap-2 text-xs text-muted-foreground mb-3">
        <Calendar size={14} className="mt-0.5" />
        <span>
          {formatFullDatePE(promotion.startDate)} - {formatFullDatePE(promotion.endDate)}
        </span>
      </div>

      {isInactive ? (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(promotion)}>
            Editar
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-[#047857] hover:bg-[#047857]/90 text-white"
            onClick={() => onActivate(promotion)}
          >
            Activar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-destructive hover:bg-destructive/10 border-destructive"
            onClick={() => onDelete(promotion)}
          >
            Borrar
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(promotion)}>
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-destructive hover:bg-destructive/10"
            onClick={() => onDeactivate(promotion)}
          >
            Desactivar
          </Button>
        </div>
      )}
    </div>
  );
}
