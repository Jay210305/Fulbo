import { Loader2 } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface PaymentFooterProps {
  selectedMethod: string;
  loading: boolean;
  grandTotal: number;
  onPay: () => void;
}

export function PaymentFooter({
  selectedMethod,
  loading,
  grandTotal,
  onPay,
}: PaymentFooterProps) {
  const getButtonText = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Procesando...
        </>
      );
    }
    
    if (selectedMethod) {
      return `Pagar S/ ${grandTotal.toFixed(2)}`;
    }
    
    return 'Selecciona un método de pago';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 shadow-lg">
      <Button
        onClick={onPay}
        disabled={!selectedMethod || loading}
        className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90 disabled:opacity-50"
      >
        {getButtonText()}
      </Button>
    </div>
  );
}
