import { Loader2 } from 'lucide-react';
import { Match, formatDateSpanish } from '../types';
import { MatchCard } from './MatchCard';

interface MatchesListProps {
  matches: Match[];
  date: Date | undefined;
  loading: boolean;
  onEditMatch: (match: Match) => void;
  onContactMatch: (match: Match) => void;
}

export function MatchesList({ matches, date, loading, onEditMatch, onContactMatch }: MatchesListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3>Partidos del {formatDateSpanish(date)}</h3>
        <p className="text-sm text-muted-foreground">{matches.length} partidos</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#047857]" />
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay reservas para este día</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onEdit={onEditMatch}
              onContact={onContactMatch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
