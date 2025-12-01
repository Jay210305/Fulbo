import { AlertTriangle, XCircle, Info, CheckCircle } from 'lucide-react';
import { cn } from '../ui/utils';

type AlertVariant = 'error' | 'warning' | 'info' | 'success';

interface AlertBannerProps {
  /** Alert variant */
  variant?: AlertVariant;
  /** Title text (optional) */
  title?: string;
  /** Main message */
  message: string;
  /** Additional content below the message */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

const variantStyles: Record<AlertVariant, { container: string; icon: string }> = {
  error: {
    container: 'bg-red-50 border-red-200 text-red-700',
    icon: 'text-red-500',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-700',
    icon: 'text-amber-500',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-700',
    icon: 'text-blue-500',
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-700',
    icon: 'text-green-500',
  },
};

const variantIcons: Record<AlertVariant, typeof AlertTriangle> = {
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

export function AlertBanner({
  variant = 'error',
  title,
  message,
  children,
  className,
}: AlertBannerProps) {
  const styles = variantStyles[variant];
  const Icon = variantIcons[variant];

  return (
    <div className={cn('p-3 border rounded-lg', styles.container, className)}>
      <div className="flex items-start gap-2">
        <Icon size={18} className={cn('mt-0.5 flex-shrink-0', styles.icon)} />
        <div className="flex-1">
          {title && <p className="font-medium mb-1">{title}</p>}
          <p className="text-sm">{message}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

interface ErrorBannerProps {
  /** Error message to display */
  message: string;
  /** Additional content below the message */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function ErrorBanner({ message, children, className }: ErrorBannerProps) {
  return (
    <AlertBanner variant="error" message={message} className={className}>
      {children}
    </AlertBanner>
  );
}
