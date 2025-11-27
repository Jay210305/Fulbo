import { useState } from "react";
import { ArrowLeft, CreditCard, Building2, Banknote, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface PaymentCollectionSettingsProps {
  onBack: () => void;
}

export function PaymentCollectionSettings({ onBack }: PaymentCollectionSettingsProps) {
  const [paymentMethods, setPaymentMethods] = useState({
    creditCard: {
      enabled: true,
      gateway: 'mercadopago',
      publicKey: 'TEST-xxxxxx-xxxx-xxxx',
      secretKey: '••••••••••••'
    },
    bankTransfer: {
      enabled: true,
      bankName: 'BCP',
      accountNumber: '123-456789-0-12',
      accountType: 'Cuenta Corriente',
      accountHolder: 'Carlos Rodríguez'
    },
    cash: {
      enabled: true
    },
    yape: {
      enabled: true,
      phoneNumber: '923 456 789'
    }
  });

  const handleSave = () => {
    alert('Métodos de cobranza actualizados exitosamente');
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>Configuración de Cobranza</h2>
      </div>

      <div className="p-4 space-y-6">
        <div className="bg-secondary border-l-4 border-[#047857] rounded-lg p-4">
          <p className="text-sm">
            Configura los métodos de pago que aceptarás para las reservas de tus canchas. Los usuarios verán estas opciones al momento de pagar.
          </p>
        </div>

        {/* Tarjeta de Crédito/Débito */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <CreditCard size={20} className="text-[#047857]" />
              </div>
              <div>
                <p>Tarjeta de Crédito/Débito</p>
                <p className="text-sm text-muted-foreground">Requiere pasarela de pago</p>
              </div>
            </div>
            <Switch
              checked={paymentMethods.creditCard.enabled}
              onCheckedChange={(checked: boolean) => 
                setPaymentMethods({
                  ...paymentMethods,
                  creditCard: { ...paymentMethods.creditCard, enabled: checked }
                })
              }
            />
          </div>

          {paymentMethods.creditCard.enabled && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <Label>Pasarela de Pago</Label>
                <Select 
                  value={paymentMethods.creditCard.gateway}
                  onValueChange={(value: string) => 
                    setPaymentMethods({
                      ...paymentMethods,
                      creditCard: { ...paymentMethods.creditCard, gateway: value }
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="culqi">Culqi</SelectItem>
                    <SelectItem value="payu">PayU</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Clave Pública (Public Key)</Label>
                <Input
                  value={paymentMethods.creditCard.publicKey}
                  onChange={(e) => 
                    setPaymentMethods({
                      ...paymentMethods,
                      creditCard: { ...paymentMethods.creditCard, publicKey: e.target.value }
                    })
                  }
                  className="mt-2"
                  placeholder="TEST-xxxxxx-xxxx-xxxx"
                />
              </div>

              <div>
                <Label>Clave Secreta (Secret Key)</Label>
                <Input
                  type="password"
                  value={paymentMethods.creditCard.secretKey}
                  onChange={(e) => 
                    setPaymentMethods({
                      ...paymentMethods,
                      creditCard: { ...paymentMethods.creditCard, secretKey: e.target.value }
                    })
                  }
                  className="mt-2"
                  placeholder="••••••••••••"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>Importante:</strong> Mantén tus claves seguras. Nunca las compartas con nadie.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Transferencia Bancaria */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Building2 size={20} className="text-[#047857]" />
              </div>
              <div>
                <p>Transferencia Bancaria</p>
                <p className="text-sm text-muted-foreground">Cuenta bancaria</p>
              </div>
            </div>
            <Switch
              checked={paymentMethods.bankTransfer.enabled}
              onCheckedChange={(checked: boolean) => 
                setPaymentMethods({
                  ...paymentMethods,
                  bankTransfer: { ...paymentMethods.bankTransfer, enabled: checked }
                })
              }
            />
          </div>

          {paymentMethods.bankTransfer.enabled && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <Label>Banco</Label>
                <Select 
                  value={paymentMethods.bankTransfer.bankName}
                  onValueChange={(value: string) => 
                    setPaymentMethods({
                      ...paymentMethods,
                      bankTransfer: { ...paymentMethods.bankTransfer, bankName: value }
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BCP">BCP</SelectItem>
                    <SelectItem value="BBVA">BBVA</SelectItem>
                    <SelectItem value="Interbank">Interbank</SelectItem>
                    <SelectItem value="Scotiabank">Scotiabank</SelectItem>
                    <SelectItem value="Banco de la Nación">Banco de la Nación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo de Cuenta</Label>
                <Select 
                  value={paymentMethods.bankTransfer.accountType}
                  onValueChange={(value: string) => 
                    setPaymentMethods({
                      ...paymentMethods,
                      bankTransfer: { ...paymentMethods.bankTransfer, accountType: value }
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cuenta Corriente">Cuenta Corriente</SelectItem>
                    <SelectItem value="Cuenta de Ahorros">Cuenta de Ahorros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Número de Cuenta</Label>
                <Input
                  value={paymentMethods.bankTransfer.accountNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setPaymentMethods({
                      ...paymentMethods,
                      bankTransfer: { ...paymentMethods.bankTransfer, accountNumber: e.target.value }
                    })
                  }
                  className="mt-2"
                  placeholder="123-456789-0-12"
                />
              </div>

              <div>
                <Label>Titular de la Cuenta</Label>
                <Input
                  value={paymentMethods.bankTransfer.accountHolder}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setPaymentMethods({
                      ...paymentMethods,
                      bankTransfer: { ...paymentMethods.bankTransfer, accountHolder: e.target.value }
                    })
                  }
                  className="mt-2"
                  placeholder="Carlos Rodríguez"
                />
              </div>
            </div>
          )}
        </div>

        {/* Yape / Plin */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600">Y</span>
              </div>
              <div>
                <p>Yape / Plin</p>
                <p className="text-sm text-muted-foreground">Billetera digital</p>
              </div>
            </div>
            <Switch
              checked={paymentMethods.yape.enabled}
              onCheckedChange={(checked: boolean) => 
                setPaymentMethods({
                  ...paymentMethods,
                  yape: { ...paymentMethods.yape, enabled: checked }
                })
              }
            />
          </div>

          {paymentMethods.yape.enabled && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <Label>Número de Celular</Label>
                <Input
                  value={paymentMethods.yape.phoneNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setPaymentMethods({
                      ...paymentMethods,
                      yape: { ...paymentMethods.yape, phoneNumber: e.target.value }
                    })
                  }
                  className="mt-2"
                  placeholder="923 456 789"
                />
              </div>
            </div>
          )}
        </div>

        {/* Efectivo/Presencial */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Banknote size={20} className="text-[#047857]" />
              </div>
              <div>
                <p>Efectivo / Presencial</p>
                <p className="text-sm text-muted-foreground">Pago al llegar a la cancha</p>
              </div>
            </div>
            <Switch
              checked={paymentMethods.cash.enabled}
              onCheckedChange={(checked: boolean) => 
                setPaymentMethods({
                  ...paymentMethods,
                  cash: { ...paymentMethods.cash, enabled: checked }
                })
              }
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-secondary rounded-xl p-4">
          <h3 className="mb-3">Métodos Habilitados</h3>
          <div className="space-y-2">
            {paymentMethods.creditCard.enabled && (
              <div className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-[#047857]" />
                <span>Tarjeta de Crédito/Débito ({paymentMethods.creditCard.gateway})</span>
              </div>
            )}
            {paymentMethods.bankTransfer.enabled && (
              <div className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-[#047857]" />
                <span>Transferencia Bancaria ({paymentMethods.bankTransfer.bankName})</span>
              </div>
            )}
            {paymentMethods.yape.enabled && (
              <div className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-[#047857]" />
                <span>Yape / Plin</span>
              </div>
            )}
            {paymentMethods.cash.enabled && (
              <div className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-[#047857]" />
                <span>Efectivo / Presencial</span>
              </div>
            )}
            {!paymentMethods.creditCard.enabled && !paymentMethods.bankTransfer.enabled && 
             !paymentMethods.yape.enabled && !paymentMethods.cash.enabled && (
              <p className="text-sm text-muted-foreground">No hay métodos habilitados</p>
            )}
          </div>
        </div>

        <Button 
          className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
          onClick={handleSave}
        >
          Guardar Métodos de Cobranza
        </Button>
      </div>
    </div>
  );
}
