import { useState } from "react";
import { Logo } from "../shared/Logo";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { RegisterData } from "../../../services/auth.api";

interface RegisterScreenProps {
  onRegister: (data: RegisterData) => Promise<void>;
  onBack: () => void;
  error?: string | null;
}

export function RegisterScreen({ onRegister, onBack, error }: RegisterScreenProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleStep1 = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setLocalError("Ingresa tus nombres y apellidos");
      return;
    }
    setLocalError(null);
    setStep(2);
  };

  const handleStep2 = async () => {
    if (!email || password.length < 6) {
      setLocalError("Ingresa un correo válido y una contraseña de al menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Las contraseñas no coinciden");
      return;
    }
    setLocalError(null);
    setLoading(true);
    try {
      await onRegister({ email, password, firstName, lastName });
    } catch {
      // error surfaced via the authError prop from the session context
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="text-center mb-6">
            <Logo size="md" />
            <p className="text-muted-foreground mt-2">Paso 1 de 2</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombres</Label>
              <Input
                id="firstName"
                placeholder="Ingresa tus nombres"
                className="h-12"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input
                id="lastName"
                placeholder="Ingresa tus apellidos"
                className="h-12"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="docType">Tipo de documento</Label>
              <Select>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dni">DNI</SelectItem>
                  <SelectItem value="passport">Pasaporte</SelectItem>
                  <SelectItem value="ce">Carnet de Extranjería</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="docNumber">Documento de identificación</Label>
              <Input id="docNumber" placeholder="Número de documento" className="h-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Select>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona tu ciudad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="juliaca">Juliaca</SelectItem>
                  <SelectItem value="puno">Puno</SelectItem>
                  <SelectItem value="arequipa">Arequipa</SelectItem>
                  <SelectItem value="cusco">Cusco</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">Distrito de residencia</Label>
              <Select>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona tu distrito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="centro">Centro</SelectItem>
                  <SelectItem value="tahuaycani">Tahuaycani</SelectItem>
                  <SelectItem value="santa-barbara">Santa Bárbara</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {localError && (
            <p className="text-sm text-red-600" role="alert">
              {localError}
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onBack} className="flex-1 h-12">
              Volver
            </Button>
            <Button onClick={handleStep1} className="flex-1 h-12 bg-[#1a1a1a] hover:bg-[#2a2a2a]">
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col p-6">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center mb-6">
          <Logo size="md" />
          <p className="text-muted-foreground mt-2">Paso 2 de 2</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              className="h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="h-12"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {(error || localError) && (
          <p className="text-sm text-red-600" role="alert">
            {error || localError}
          </p>
        )}

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
            Atrás
          </Button>
          <Button
            onClick={handleStep2}
            disabled={loading}
            className="flex-1 h-12 bg-[#289B5F] hover:bg-[#289B5F]/90"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </Button>
        </div>
      </div>
    </div>
  );
}
