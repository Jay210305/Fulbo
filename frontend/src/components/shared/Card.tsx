import { cn } from '../ui/utils';

interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Border color variant */
  variant?: 'default' | 'active' | 'inactive' | 'highlighted';
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

const variantStyles = {
  default: 'border border-border bg-white',
  active: 'border-2 border-[#047857] bg-secondary',
  inactive: 'border border-gray-300 bg-gray-50',
  highlighted: 'border-2 border-[#047857] bg-secondary',
};

export function Card({ children, variant = 'default', className, onClick }: CardProps) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={cn(
        'rounded-xl p-4',
        variantStyles[variant],
        onClick && 'w-full text-left hover:shadow-md transition-shadow',
        className
      )}
    >
      {children}
    </Component>
  );
}

interface CardHeaderProps {
  /** Left side content (title, subtitle) */
  children: React.ReactNode;
  /** Right side action (badge, button) */
  action?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function CardHeader({ children, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-3', className)}>
      <div className="flex-1">{children}</div>
      {action}
    </div>
  );
}

interface CardContentProps {
  /** Content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('space-y-2', className)}>{children}</div>;
}

interface CardFooterProps {
  /** Footer content (usually buttons) */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={cn('flex gap-2 mt-3', className)}>{children}</div>;
}

interface CardIconProps {
  /** Icon element */
  children: React.ReactNode;
  /** Background variant */
  variant?: 'default' | 'inactive';
  /** Additional CSS classes */
  className?: string;
}

export function CardIcon({ children, variant = 'default', className }: CardIconProps) {
  return (
    <div
      className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center',
        variant === 'default' ? 'bg-secondary' : 'bg-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
}
