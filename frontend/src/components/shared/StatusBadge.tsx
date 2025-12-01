import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

type StatusType = 'active' | 'inactive' | 'pending' | 'confirmed' | 'cancelled' | 'paid' | 'unpaid';

interface StatusBadgeProps {
  /** Status type */
  status: StatusType;
  /** Custom label (overrides default) */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: {
    label: 'Activa',
    className: 'bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none',
  },
  inactive: {
    label: 'Pausada',
    className: 'bg-gray-400 hover:bg-gray-400/90 text-white border-none',
  },
  pending: {
    label: 'Pendiente',
    className: 'bg-amber-500 hover:bg-amber-500/90 text-white border-none',
  },
  confirmed: {
    label: 'Confirmado',
    className: 'bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-destructive hover:bg-destructive/90 text-white border-none',
  },
  paid: {
    label: 'Pagado',
    className: 'bg-[#047857] hover:bg-[#047857]/90 text-white border-none',
  },
  unpaid: {
    label: 'Pago Pendiente',
    className: '',
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  if (status === 'unpaid') {
    return (
      <Badge variant="outline" className={cn(className)}>
        {label || config.label}
      </Badge>
    );
  }

  return (
    <Badge className={cn(config.className, className)}>
      {label || config.label}
    </Badge>
  );
}

interface FeatureBadgeProps {
  /** Badge label */
  label: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'popular';
  /** Additional CSS classes */
  className?: string;
}

const featureVariantStyles = {
  primary: 'bg-[#047857] hover:bg-[#047857]/90 text-white border-none',
  secondary: 'bg-secondary text-foreground',
  popular: 'bg-[#047857] hover:bg-[#047857]/90 text-white border-none',
};

export function FeatureBadge({ label, icon, variant = 'secondary', className }: FeatureBadgeProps) {
  return (
    <Badge className={cn(featureVariantStyles[variant], className)}>
      {icon}
      {label}
    </Badge>
  );
}
