import { Ban, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { ScheduleBlock, REASON_LABELS, REASON_COLORS, formatDateSpanish } from '../types';

interface BlocksListProps {
  blocks: ScheduleBlock[];
  date: Date | undefined;
  deletingBlockId: string | null;
  onDeleteBlock: (blockId: string) => void;
}

export function BlocksList({ blocks, date, deletingBlockId, onDeleteBlock }: BlocksListProps) {
  if (blocks.length === 0) return null;

  return (
    <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Ban size={18} className="text-orange-600" />
        <h3 className="font-medium text-orange-800">
          Bloqueos para {formatDateSpanish(date)}
        </h3>
      </div>
      <div className="space-y-2">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-10 rounded ${REASON_COLORS[block.reason]}`}></div>
              <div>
                <p className="font-medium">{block.fieldName}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(block.startTime).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(block.endTime).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {REASON_LABELS[block.reason]}
                  </Badge>
                  {block.note && (
                    <span className="text-xs text-muted-foreground">{block.note}</span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteBlock(block.id)}
              disabled={deletingBlockId === block.id}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              {deletingBlockId === block.id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
