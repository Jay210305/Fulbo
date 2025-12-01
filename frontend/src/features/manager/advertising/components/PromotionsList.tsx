import { Plus, Tag } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Promotion } from '../types';
import { PromotionCard } from './PromotionCard';

interface PromotionsListProps {
  promotions: Promotion[];
  onCreatePromotion: () => void;
  onEditPromotion: (promo: Promotion) => void;
  onDeactivatePromotion: (promo: Promotion) => void;
  onActivatePromotion: (promo: Promotion) => void;
  onDeletePromotion: (promo: Promotion) => void;
}

export function PromotionsList({
  promotions,
  onCreatePromotion,
  onEditPromotion,
  onDeactivatePromotion,
  onActivatePromotion,
  onDeletePromotion,
}: PromotionsListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3>Promociones Personalizadas</h3>
          <p className="text-sm text-muted-foreground">Crea ofertas especiales para tus canchas</p>
        </div>
        <button
          onClick={onCreatePromotion}
          className="w-10 h-10 bg-[#047857] hover:bg-[#047857]/90 rounded-full flex items-center justify-center text-white"
        >
          <Plus size={20} />
        </button>
      </div>

      {promotions.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
          <Tag size={48} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Aún no tienes promociones activas</p>
          <Button onClick={onCreatePromotion} className="bg-[#047857] hover:bg-[#047857]/90">
            <Plus size={18} className="mr-2" />
            Crear Primera Promoción
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {promotions.map((promo) => (
            <PromotionCard
              key={promo.id}
              promotion={promo}
              onEdit={onEditPromotion}
              onDeactivate={onDeactivatePromotion}
              onActivate={onActivatePromotion}
              onDelete={onDeletePromotion}
            />
          ))}
        </div>
      )}
    </div>
  );
}
