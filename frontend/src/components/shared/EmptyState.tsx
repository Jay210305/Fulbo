import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface EmptyStateProps {
  /** Icon to display */
  icon: LucideIcon;
  /** Title text */
  title?: string;
  /** Description text */
  description: string;
  /** Action button text */
  actionLabel?: string;
  /** Action button callback */
  onAction?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show dashed border */
  dashed?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  dashed = true,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'text-center py-12 rounded-lg',
        dashed ? 'border-2 border-dashed border-border' : 'border border-border',
        className
      )}
    >
      <Icon size={48} className="mx-auto mb-3 text-muted-foreground" />
      {title && <h4 className="mb-2">{title}</h4>}
      <p className="text-muted-foreground mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-[#047857] hover:bg-[#047857]/90">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

interface SimpleEmptyStateProps {
  /** Message to display */
  message: string;
  /** Additional CSS classes */
  className?: string;
}

export function SimpleEmptyState({ message, className }: SimpleEmptyStateProps) {
  return (
    <div className={cn('text-center py-8 text-muted-foreground', className)}>
      <p>{message}</p>
    </div>
  );
}
