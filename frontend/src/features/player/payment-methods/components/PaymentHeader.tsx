import { ArrowLeft } from 'lucide-react';

interface PaymentHeaderProps {
  onBack: () => void;
}

export function PaymentHeader({ onBack }: PaymentHeaderProps) {
  return (
    <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
      <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
        <ArrowLeft size={20} />
      </button>
      <h2>Método de Pago</h2>
    </div>
  );
}
