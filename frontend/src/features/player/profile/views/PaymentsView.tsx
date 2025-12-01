import { ChevronRight } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Separator } from "../../../../components/ui/separator";
import { SectionHeader } from "../components/SectionHeader";
import { PaymentMethod, Transaction } from "../types";

interface PaymentsViewProps {
  onBack: () => void;
}

// Mock data - would come from API
const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { type: 'visa', lastFour: '4532', expiryDate: '12/25' },
  { type: 'yape', phone: '923 456 789', verified: true }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { description: 'Canchita La Merced', date: '8 Oct 2024', amount: 35, status: 'Completado' },
  { description: 'Full Vaso - Agua', date: '8 Oct 2024', amount: 2, status: 'Completado' },
  { description: 'Estadio Zona Sur', date: '1 Oct 2024', amount: 45, status: 'Completado' }
];

export function PaymentsView({ onBack }: PaymentsViewProps) {
  return (
    <div className="min-h-screen bg-white pb-20">
      <SectionHeader title="Pagos" onBack={onBack} />

      <div className="p-4 space-y-6">
        {/* Payment Methods */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3>Métodos de Pago</h3>
            <Button variant="outline" size="sm">+ Agregar</Button>
          </div>
          <div className="space-y-3">
            {MOCK_PAYMENT_METHODS.map((method, index) => (
              <PaymentMethodCard key={index} method={method} />
            ))}
          </div>
        </div>

        <Separator />

        {/* Transaction History */}
        <div>
          <h3 className="mb-3">Historial de Transacciones</h3>
          <div className="space-y-3">
            {MOCK_TRANSACTIONS.map((transaction, index) => (
              <TransactionCard key={index} transaction={transaction} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodCard({ method }: { method: PaymentMethod }) {
  const getMethodDisplay = () => {
    if (method.type === 'visa' || method.type === 'mastercard') {
      return {
        badge: method.type.toUpperCase(),
        bgColor: method.type === 'visa' ? 'bg-blue-600' : 'bg-orange-600',
        primary: `•••• ${method.lastFour}`,
        secondary: `Vence ${method.expiryDate}`
      };
    }
    return {
      badge: method.type.toUpperCase(),
      bgColor: 'bg-purple-600',
      primary: method.phone || '',
      secondary: method.verified ? 'Verificado' : 'No verificado'
    };
  };

  const display = getMethodDisplay();

  return (
    <div className="border border-border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-8 ${display.bgColor} rounded flex items-center justify-center text-white text-xs`}>
          {display.badge}
        </div>
        <div>
          <p>{display.primary}</p>
          <p className="text-sm text-muted-foreground">{display.secondary}</p>
        </div>
      </div>
      <ChevronRight size={20} />
    </div>
  );
}

function TransactionCard({ transaction }: { transaction: Transaction }) {
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p>{transaction.description}</p>
        <span className="text-[#047857]">S/ {transaction.amount}</span>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{transaction.date}</p>
        <span className="text-xs text-green-600">{transaction.status}</span>
      </div>
    </div>
  );
}
