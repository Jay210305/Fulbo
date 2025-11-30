import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Building2, Banknote, Check, Loader2 } from "lucide-react";
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
import { managerApi, PaymentSettings } from "../../services/manager.api";

interface PaymentCollectionSettingsProps {
  onBack: () => void;
}

export function PaymentCollectionSettings({ onBack }: PaymentCollectionSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PaymentSettings>({
    yapeEnabled: false,
    yapePhone: null,
    plinEnabled: false,
    plinPhone: null,
    bankTransferEnabled: false,
    bankName: null,
    bankAccountNumber: null,
    bankAccountHolder: null,
    bankCci: null,
    cashEnabled: true,
  });

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await managerApi.paymentSettings.get();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching payment settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await managerApi.paymentSettings.update({
        yapeEnabled: settings.yapeEnabled,
        yapePhone: settings.yapePhone || undefined,
        plinEnabled: settings.plinEnabled,
        plinPhone: settings.plinPhone || undefined,
        bankTransferEnabled: settings.bankTransferEnabled,
        bankName: settings.bankName || undefined,
        bankAccountNumber: settings.bankAccountNumber || undefined,
        bankAccountHolder: settings.bankAccountHolder || undefined,
        bankCci: settings.bankCci || undefined,
        cashEnabled: settings.cashEnabled,
      });
      alert('Métodos de cobranza actualizados exitosamente');
    } catch (err) {
      console.error('Error saving payment settings:', err);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#047857]" />
      </div>
    );
  }

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

        {/* Yape */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">Y</span>
              </div>
              <div>
                <p>Yape</p>
                <p className="text-sm text-muted-foreground">Billetera digital</p>
              </div>
            </div>
            <Switch
              checked={settings.yapeEnabled}
              onCheckedChange={(checked: boolean) => 
                setSettings({ ...settings, yapeEnabled: checked })
              }
            />
          </div>

          {settings.yapeEnabled && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <Label>Número de Celular Yape</Label>
                <Input
                  value={settings.yapePhone || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setSettings({ ...settings, yapePhone: e.target.value })
                  }
                  className="mt-2"
                  placeholder="923 456 789"
                />
              </div>
            </div>
          )}
        </div>

        {/* Plin */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">P</span>
              </div>
              <div>
                <p>Plin</p>
                <p className="text-sm text-muted-foreground">Billetera digital</p>
              </div>
            </div>
            <Switch
              checked={settings.plinEnabled}
              onCheckedChange={(checked: boolean) => 
                setSettings({ ...settings, plinEnabled: checked })
              }
            />
          </div>

          {settings.plinEnabled && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <Label>Número de Celular Plin</Label>
                <Input
                  value={settings.plinPhone || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setSettings({ ...settings, plinPhone: e.target.value })
                  }
                  className="mt-2"
                  placeholder="923 456 789"
                />
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
              checked={settings.bankTransferEnabled}
              onCheckedChange={(checked: boolean) => 
                setSettings({ ...settings, bankTransferEnabled: checked })
              }
            />
          </div>

          {settings.bankTransferEnabled && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <Label>Banco</Label>
                <Select 
                  value={settings.bankName || ''}
                  onValueChange={(value: string) => 
                    setSettings({ ...settings, bankName: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecciona un banco" />
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
                <Label>Número de Cuenta</Label>
                <Input
                  value={settings.bankAccountNumber || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setSettings({ ...settings, bankAccountNumber: e.target.value })
                  }
                  className="mt-2"
                  placeholder="123-456789-0-12"
                />
              </div>

              <div>
                <Label>Titular de la Cuenta</Label>
                <Input
                  value={settings.bankAccountHolder || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setSettings({ ...settings, bankAccountHolder: e.target.value })
                  }
                  className="mt-2"
                  placeholder="Carlos Rodríguez"
                />
              </div>

              <div>
                <Label>CCI (Código Interbancario)</Label>
                <Input
                  value={settings.bankCci || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setSettings({ ...settings, bankCci: e.target.value })
                  }
                  className="mt-2"
                  placeholder="00212345678901234567"
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
              checked={settings.cashEnabled}
              onCheckedChange={(checked: boolean) => 
                setSettings({ ...settings, cashEnabled: checked })
              }
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-secondary rounded-xl p-4">
          <h3 className="mb-3">Métodos Habilitados</h3>
          <div className="space-y-2">
            {settings.yapeEnabled && (
              <div className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-[#047857]" />
                <span>Yape {settings.yapePhone && `(${settings.yapePhone})`}</span>
              </div>
            )}
            {settings.plinEnabled && (
              <div className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-[#047857]" />
                <span>Plin {settings.plinPhone && `(${settings.plinPhone})`}</span>
              </div>
            )}
            {settings.bankTransferEnabled && (
              <div className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-[#047857]" />
                <span>Transferencia Bancaria {settings.bankName && `(${settings.bankName})`}</span>
              </div>
            )}
            {settings.cashEnabled && (
              <div className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-[#047857]" />
                <span>Efectivo / Presencial</span>
              </div>
            )}
            {!settings.yapeEnabled && !settings.plinEnabled && 
             !settings.bankTransferEnabled && !settings.cashEnabled && (
              <p className="text-sm text-muted-foreground">No hay métodos habilitados</p>
            )}
          </div>
        </div>

        <Button 
          className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Guardar Métodos de Cobranza
        </Button>
      </div>
    </div>
  );
}
                  </SelectTrigger>
                  <SelectContent>
