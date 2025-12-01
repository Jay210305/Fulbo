import { X, CreditCard } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Plan, Field } from '../types';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  plan: Plan;
  fields: Field[];
  onConfirmPayment: () => void;
}

export function PaymentModal({ open, onClose, plan, fields, onConfirmPayment }: PaymentModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
          <h2>Finalizar Compra</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Plan Summary */}
          <div className="bg-secondary rounded-xl p-4">
            <h3 className="mb-3">Resumen del Plan</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <span>{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duración:</span>
                <span>{plan.duration}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-2">
                <span>Total:</span>
                <span className="text-xl text-[#047857]">S/ {plan.price}</span>
              </div>
            </div>
          </div>

          {/* Field Selection */}
          <div>
            <Label className="mb-2">Cancha a promocionar</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cancha..." />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field.id} value={field.name}>
                    {field.name} ({field.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="mb-3">Método de Pago</h3>
            <div className="space-y-3">
              <button className="w-full p-4 border-2 border-[#047857] bg-secondary rounded-xl flex items-center gap-3">
                <CreditCard className="text-[#047857]" />
                <div className="text-left">
                  <p>Tarjeta de Crédito/Débito</p>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, etc.</p>
                </div>
              </button>

              <button className="w-full p-4 border border-border rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xs">Y</span>
                </div>
                <div className="text-left">
                  <p>Yape / Plin</p>
                  <p className="text-sm text-muted-foreground">Billetera digital</p>
                </div>
              </button>
            </div>
          </div>

          {/* Card Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Número de Tarjeta</Label>
              <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="h-12" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Vencimiento</Label>
                <Input id="expiry" placeholder="MM/AA" className="h-12" />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" className="h-12" type="password" />
              </div>
            </div>

            <div>
              <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
              <Input id="cardName" placeholder="Juan Pérez" className="h-12" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border p-4">
          <Button
            className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
            onClick={onConfirmPayment}
          >
            Confirmar Pago - S/ {plan.price}
          </Button>
        </div>
      </div>
    </div>
  );
}
