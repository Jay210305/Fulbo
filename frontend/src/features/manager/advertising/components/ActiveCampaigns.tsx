import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Campaign, formatDatePE } from '../types';

interface ActiveCampaignsProps {
  campaigns: Campaign[];
  onRenew: () => void;
}

export function ActiveCampaigns({ campaigns, onRenew }: ActiveCampaignsProps) {
  if (campaigns.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3">Campañas Activas</h3>
      <div className="space-y-3">
        {campaigns.map((campaign) => (
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
                <p className="text-sm">{formatDatePE(campaign.startDate)}</p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-1">Fin</p>
                <p className="text-sm">{formatDatePE(campaign.endDate)}</p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-1">Quedan</p>
                <p className="text-sm text-[#047857]">{campaign.daysRemaining}d</p>
              </div>
            </div>

            <Button className="w-full" variant="outline" onClick={onRenew}>
              Renovar Campaña
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
