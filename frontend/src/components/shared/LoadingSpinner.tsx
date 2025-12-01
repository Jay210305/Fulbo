import { Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';

interface LoadingSpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Center the spinner in its container */
  centered?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingSpinner({ size = 'md', className, centered = false }: LoadingSpinnerProps) {
  const spinner = (
    <Loader2
      className={cn(sizeClasses[size], 'animate-spin text-[#047857]', className)}
    />
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center py-8">
        {spinner}
      </div>
    );
  }

  return spinner;
}

interface LoadingStateProps {
  /** Message to display below the spinner */
  message?: string;
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes for the container */
  className?: string;
}

export function LoadingState({ message, size = 'lg', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <LoadingSpinner size={size} className="mb-4" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

interface ButtonLoadingProps {
  /** Whether to show the loading spinner */
  loading?: boolean;
  /** Text to display */
  children: React.ReactNode;
  /** Size of the spinner */
  size?: 'sm' | 'md';
}

export function ButtonLoading({ loading, children, size = 'sm' }: ButtonLoadingProps) {
  return (
    <>
      {loading && <LoadingSpinner size={size} className="mr-2" />}
      {children}
    </>
  );
}
