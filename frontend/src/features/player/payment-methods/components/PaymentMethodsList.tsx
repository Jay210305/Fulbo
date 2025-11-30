import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import { Label } from '../../../../components/ui/label';
import { PaymentMethod } from '../types';

interface PaymentMethodsListProps {
  methods: PaymentMethod[];
  selectedMethod: string;
  onSelectMethod: (methodId: string) => void;
}

export function PaymentMethodsList({
  methods,
  selectedMethod,
  onSelectMethod,
}: PaymentMethodsListProps) {
  return (
    <div>
      <h3 className="mb-4">Selecciona tu método de pago</h3>
      <RadioGroup value={selectedMethod} onValueChange={onSelectMethod}>
        <div className="space-y-3">
          {methods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <div
                key={method.id}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#047857] bg-secondary'
                    : 'border-border hover:border-muted-foreground'
                }`}
                onClick={() => onSelectMethod(method.id)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#047857] text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={method.id} className="cursor-pointer">
                      {method.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                  <RadioGroupItem value={method.id} id={method.id} />
                </div>
              </div>
            );
          })}
        </div>
      </RadioGroup>
    </div>
  );
}
