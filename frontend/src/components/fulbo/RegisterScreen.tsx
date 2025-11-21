import { useState } from "react";
import { Logo } from "../shared/Logo";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CheckCircle2 } from "lucide-react";

interface RegisterScreenProps {
  onRegister: () => void;
  onBack: () => void;
}

export function RegisterScreen({ onRegister, onBack }: RegisterScreenProps) {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleStep1 = () => {
    setStep(2);
  };

  const handleStep2 = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onRegister();
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#289B5F] flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6">
          <CheckCircle2 size={80} className="text-white mx-auto" />
          <div className="space-y-2">
            <Logo variant="white" size="lg" />
            <p className="text-white text-xl">CONEXIÓN EXITOSA</p>
          </div>
        </div>
      </div>
    );
  }

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
              <Input id="firstName" placeholder="Ingresa tus nombres" className="h-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input id="lastName" placeholder="Ingresa tus apellidos" className="h-12" />
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
            <Input id="email" type="email" placeholder="ejemplo@correo.com" className="h-12" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="••••••••" className="h-12" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" className="h-12" />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
            Atrás
          </Button>
          <Button onClick={handleStep2} className="flex-1 h-12 bg-[#289B5F] hover:bg-[#289B5F]/90">
            Registrarse
          </Button>
        </div>
      </div>
    </div>
  );
}
