import { PaymentMethodsScreenProps } from './types';
import { usePaymentMethods } from './usePaymentMethods';
import { PAYMENT_METHODS } from './constants';
import {
  PaymentHeader,
  PaymentSummaryCard,
  PaymentMethodsList,
  SecurityNotice,
  PaymentFooter,
} from './components';

export function PaymentMethodsScreen({
  matchName,
  onBack,
  onPaymentComplete,
}: PaymentMethodsScreenProps) {
  const {
    selectedMethod,
    loading,
    grandTotal,
    cart,
    setSelectedMethod,
    handlePay,
  } = usePaymentMethods({ matchName, onPaymentComplete });

  return (
    <div className="min-h-screen bg-white pb-32">
      <PaymentHeader onBack={onBack} />

      <div className="p-4 space-y-6">
        <PaymentSummaryCard
          grandTotal={grandTotal}
          matchName={matchName}
          fieldName={cart.field?.name}
          selectedTime={cart.selectedTime}
        />

        <PaymentMethodsList
          methods={PAYMENT_METHODS}
          selectedMethod={selectedMethod}
          onSelectMethod={setSelectedMethod}
        />

        <SecurityNotice />
      </div>

      <PaymentFooter
        selectedMethod={selectedMethod}
        loading={loading}
        grandTotal={grandTotal}
        onPay={handlePay}
      />
    </div>
  );
}
