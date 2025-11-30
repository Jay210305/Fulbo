import { LucideIcon, Plus } from 'lucide-react';
import { cn } from '../ui/utils';

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Right side content (e.g., action buttons) */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div>
        <h1 className="text-2xl mb-1">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  /** Section title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Right side content */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function SectionHeader({ title, subtitle, children, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div>
        <h3>{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

interface FloatingActionButtonProps {
  /** Click handler */
  onClick: () => void;
  /** Icon to display (defaults to Plus) */
  icon?: LucideIcon;
  /** Button title for accessibility */
  title?: string;
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'warning';
  /** Additional CSS classes */
  className?: string;
}

const fabVariantStyles = {
  primary: 'bg-[#047857] hover:bg-[#047857]/90',
  secondary: 'bg-gray-600 hover:bg-gray-600/90',
  warning: 'bg-orange-500 hover:bg-orange-600',
};

export function FloatingActionButton({
  onClick,
  icon: Icon = Plus,
  title,
  variant = 'primary',
  className,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg',
        fabVariantStyles[variant],
        className
      )}
    >
      <Icon size={24} />
    </button>
  );
}

interface ActionButtonProps {
  /** Click handler */
  onClick: () => void;
  /** Icon to display */
  icon: LucideIcon;
  /** Button title for accessibility */
  title?: string;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'warning';
  /** Additional CSS classes */
  className?: string;
}

const actionVariantStyles = {
  primary: 'bg-[#047857] hover:bg-[#047857]/90',
  secondary: 'bg-gray-600 hover:bg-gray-600/90',
  warning: 'bg-orange-500 hover:bg-orange-600',
};

const actionSizeStyles = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
};

const actionIconSizes = {
  sm: 16,
  md: 20,
};

export function ActionButton({
  onClick,
  icon: Icon,
  title,
  size = 'md',
  variant = 'primary',
  className,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'rounded-full flex items-center justify-center text-white',
        actionVariantStyles[variant],
        actionSizeStyles[size],
        className
      )}
    >
      <Icon size={actionIconSizes[size]} />
    </button>
  );
}
