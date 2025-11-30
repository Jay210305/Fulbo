import { Plus, Tag, Loader2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { PromotionCard, InactivePromotionCard } from "./PromotionCard";
import type { Promotion } from "../types";

interface PromotionsListProps {
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCreateClick: () => void;
  onEditClick: (promotion: Promotion) => void;
  onDeactivateClick: (promotion: Promotion) => void;
}

export function PromotionsList({
  promotions,
  loading,
  error,
  onRetry,
  onCreateClick,
  onEditClick,
  onDeactivateClick
}: PromotionsListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin text-[#047857]" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
        {error}
        <Button variant="outline" size="sm" className="ml-2" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    );
  }

  const activePromotions = promotions.filter(p => p.isActive);
  const inactivePromotions = promotions.filter(p => !p.isActive);

  return (
    <>
      {/* Create Button */}
      <Button
        className="w-full bg-[#047857] hover:bg-[#047857]/90"
        onClick={onCreateClick}
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

      {/* Empty State */}
      {promotions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Tag size={48} className="mx-auto mb-4 opacity-50" />
          <p>No hay promociones registradas</p>
          <p className="text-sm">Crea tu primera promoción para atraer más clientes</p>
        </div>
      )}

      {/* Active Promotions */}
      {activePromotions.length > 0 && (
        <div>
          <h3 className="mb-4">Promociones Activas</h3>
          <div className="space-y-4">
            {activePromotions.map((promo) => (
              <PromotionCard
                key={promo.id}
                promotion={promo}
                onEdit={onEditClick}
                onDeactivate={onDeactivateClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Promotions */}
      {inactivePromotions.length > 0 && (
        <div>
          <h3 className="mb-4">Promociones Inactivas</h3>
          <div className="space-y-3">
            {inactivePromotions.map((promo) => (
              <InactivePromotionCard key={promo.id} promotion={promo} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
