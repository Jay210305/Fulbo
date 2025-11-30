import { Edit, MessageCircle } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Match } from '../types';

interface MatchCardProps {
  match: Match;
  onEdit: (match: Match) => void;
  onContact: (match: Match) => void;
}

export function MatchCard({ match, onEdit, onContact }: MatchCardProps) {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="text-center pt-1">
            <p className="text-lg">{match.time}</p>
            <p className="text-xs text-muted-foreground">{match.duration}</p>
          </div>
          <div>
            <h4 className="mb-1">{match.team}</h4>
            <p className="text-sm text-muted-foreground mb-1">{match.field}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{match.customerName}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          {match.status === 'confirmed' ? (
            <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
              Confirmado
            </Badge>
          ) : match.status === 'cancelled' ? (
            <Badge className="bg-destructive hover:bg-destructive/90 text-white border-none">
              Cancelado
            </Badge>
          ) : (
            <Badge variant="secondary">Pendiente</Badge>
          )}
          <Badge
            variant={match.paymentStatus === 'paid' ? 'default' : 'outline'}
            className={match.paymentStatus === 'paid' ? 'bg-[#047857] hover:bg-[#047857]/90' : ''}
          >
            {match.paymentStatus === 'paid' ? 'Pagado' : 'Pago Pendiente'}
          </Badge>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(match)}>
          <Edit size={14} className="mr-2" />
          Editar
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onContact(match)}>
          <MessageCircle size={14} className="mr-2" />
          Contactar
        </Button>
      </div>
    </div>
  );
}
