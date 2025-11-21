import { useState } from "react";
import { Phone, Shield, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../ui/input-otp";

interface PhoneVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerified: (phone: string) => void;
  isEditing?: boolean;
}

export function PhoneVerificationModal({ open, onClose, onVerified, isEditing = false }: PhoneVerificationModalProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countryCode, setCountryCode] = useState('+51');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendOTP = () => {
    if (phoneNumber.length >= 9) {
      // Simular envío de OTP
      setStep('otp');
      // En producción: llamar a API para enviar SMS
    }
  };

  const handleVerifyOTP = () => {
    setIsVerifying(true);
    // Simular verificación
    setTimeout(() => {
      const fullPhone = `${countryCode} ${phoneNumber}`;
      onVerified(fullPhone);
      setIsVerifying(false);
      setStep('phone');
      setPhoneNumber('');
      setOtpCode('');
    }, 1500);
  };

  const handleResendOTP = () => {
    alert('Código reenviado');
    // En producción: llamar a API para reenviar SMS
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        {step === 'phone' ? (
          <>
            <DialogHeader>
              <div className="w-12 h-12 bg-[#047857] rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={24} className="text-white" />
              </div>
              <DialogTitle className="text-center">
                {isEditing ? 'Actualizar Número de Teléfono' : 'Verificación de Contacto Obligatoria'}
              </DialogTitle>
              <DialogDescription className="text-center">
                Necesitamos tu número de teléfono para confirmar tus reservas y permitir al administrador de la cancha contactarte en caso de emergencia o cambios.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="country-code">Código de País</Label>
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger id="country-code">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+51">🇵🇪 Perú (+51)</SelectItem>
                    <SelectItem value="+1">🇺🇸 USA (+1)</SelectItem>
                    <SelectItem value="+52">🇲🇽 México (+52)</SelectItem>
                    <SelectItem value="+54">🇦🇷 Argentina (+54)</SelectItem>
                    <SelectItem value="+56">🇨🇱 Chile (+56)</SelectItem>
                    <SelectItem value="+57">🇨🇴 Colombia (+57)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Número de Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="987654321"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  maxLength={9}
                />
                <p className="text-xs text-muted-foreground">
                  Ingresa tu número sin el código de país
                </p>
              </div>

              <div className="bg-secondary rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-[#047857]" />
                  <p className="text-sm">Tu privacidad está protegida</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Solo el administrador de las canchas que reserves podrá ver tu número de teléfono. Otros jugadores NO tendrán acceso a esta información.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                className="w-full bg-[#047857] hover:bg-[#047857]/90"
                onClick={handleSendOTP}
                disabled={phoneNumber.length < 9}
              >
                Guardar y Verificar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="w-12 h-12 bg-[#047857] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={24} className="text-white" />
              </div>
              <DialogTitle className="text-center">Verificar Código</DialogTitle>
              <DialogDescription className="text-center">
                Ingresa el código de 6 dígitos que enviamos a<br />
                <strong>{countryCode} {phoneNumber}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={(value) => setOtpCode(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="text-center">
                <button
                  onClick={handleResendOTP}
                  className="text-sm text-[#047857] hover:underline"
                >
                  No recibí el código, reenviar
                </button>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2">
              <Button
                className="w-full bg-[#047857] hover:bg-[#047857]/90"
                onClick={handleVerifyOTP}
                disabled={otpCode.length !== 6 || isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Check size={16} className="mr-2 animate-pulse" />
                    Verificando...
                  </>
                ) : (
                  'Verificar Código'
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStep('phone')}
              >
                Cambiar Número
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
