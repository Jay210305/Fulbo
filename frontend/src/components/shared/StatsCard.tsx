import { cn } from '../ui/utils';

interface StatsCardProps {
  /** Label text */
  label: string;
  /** Value to display */
  value: string | number;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Color variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  /** Additional CSS classes */
  className?: string;
}

const variantStyles = {
  default: 'text-foreground',
  primary: 'text-[#047857]',
  success: 'text-green-600',
  warning: 'text-amber-600',
  error: 'text-red-600',
};

export function StatsCard({ label, value, icon, variant = 'default', className }: StatsCardProps) {
  return (
    <div className={cn('bg-secondary rounded-lg p-3', className)}>
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={cn('text-lg font-semibold', variantStyles[variant])}>{value}</p>
        </div>
      </div>
    </div>
  );
}

interface StatsGridProps {
  /** Stats items */
  children: React.ReactNode;
  /** Number of columns */
  columns?: 2 | 3 | 4;
  /** Additional CSS classes */
  className?: string;
}

const columnClasses = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

export function StatsGrid({ children, columns = 3, className }: StatsGridProps) {
  return (
    <div className={cn('grid gap-3', columnClasses[columns], className)}>
      {children}
    </div>
  );
}

interface MiniStatsCardProps {
  /** Label text */
  label: string;
  /** Value to display */
  value: string | number;
  /** Color variant for value */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  /** Additional CSS classes */
  className?: string;
}

export function MiniStatsCard({ label, value, variant = 'default', className }: MiniStatsCardProps) {
  return (
    <div className={cn('bg-white rounded-lg p-2 text-center', className)}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn('text-sm', variantStyles[variant])}>{value}</p>
    </div>
  );
}
