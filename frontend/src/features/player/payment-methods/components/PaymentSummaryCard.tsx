interface PaymentSummaryCardProps {
  grandTotal: number;
  matchName: string;
  fieldName?: string;
  selectedTime?: string | null;
}

export function PaymentSummaryCard({
  grandTotal,
  matchName,
  fieldName,
  selectedTime,
}: PaymentSummaryCardProps) {
  return (
    <div className="bg-gradient-to-r from-[#047857] to-[#10b981] rounded-xl p-6 text-white">
      <p className="text-sm text-white/80 mb-2">Total a Pagar</p>
      <p className="text-3xl">S/ {grandTotal.toFixed(2)}</p>
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-sm text-white/90">Partido: {matchName}</p>
        {fieldName && (
          <p className="text-sm text-white/90">
            {fieldName} - {selectedTime}
          </p>
        )}
      </div>
    </div>
  );
}
