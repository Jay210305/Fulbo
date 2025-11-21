import { useState } from "react";
import { Logo } from "../shared/Logo";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { CheckCircle2 } from "lucide-react";
import shieldLogo from 'figma:asset/2068dbd9380c484f3b804acfa0e6103786f83524.png';

interface OwnerRegistrationProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function OwnerRegistration({ onComplete, onCancel }: OwnerRegistrationProps) {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleStep1 = () => {
    setStep(2);
  };

  const handleStep2 = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#289B5F] flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6">
          <CheckCircle2 size={80} className="text-white mx-auto" />
          <div className="space-y-4">
            <div className="w-40 h-40 mx-auto flex items-center justify-center">
              <img
                src={shieldLogo}
                alt="Fulbo Shield Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-5xl text-white tracking-[0.15em]" style={{ fontWeight: 800 }}>
              FULBO
            </h1>
            <p className="text-white text-xl">¡REGISTRO COMPLETADO!</p>
            <p className="text-white/80 text-sm">Ahora puedes gestionar tus canchas</p>
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
            <h2 className="mt-4 mb-2">Registro de Dueño de Cancha</h2>
            <p className="text-muted-foreground text-sm">Paso 1 de 2 - Información del Complejo</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nombre del Complejo Deportivo</Label>
              <Input 
                id="businessName" 
                placeholder="Ej: Complejo Deportivo La Merced" 
                className="h-12" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ruc">RUC</Label>
              <Input 
                id="ruc" 
                placeholder="Número de RUC" 
                className="h-12" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input 
                id="address" 
                placeholder="Dirección completa del complejo" 
                className="h-12" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Select>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona la ciudad" />
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
              <Label htmlFor="district">Distrito</Label>
              <Select>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona el distrito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="centro">Centro</SelectItem>
                  <SelectItem value="tahuaycani">Tahuaycani</SelectItem>
                  <SelectItem value="santa-barbara">Santa Bárbara</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono de Contacto</Label>
              <Input 
                id="phone" 
                placeholder="Número de teléfono" 
                className="h-12" 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1 h-12">
              Cancelar
            </Button>
            <Button onClick={handleStep1} className="flex-1 h-12 bg-[#289B5F] hover:bg-[#289B5F]/90">
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
          <h2 className="mt-4 mb-2">Registro de Dueño de Cancha</h2>
          <p className="text-muted-foreground text-sm">Paso 2 de 2 - Información de Canchas</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numFields">Número de Canchas</Label>
            <Select>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="¿Cuántas canchas tienes?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 cancha</SelectItem>
                <SelectItem value="2">2 canchas</SelectItem>
                <SelectItem value="3">3 canchas</SelectItem>
                <SelectItem value="4">4 o más canchas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fieldTypes">Tipos de Cancha</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 bg-muted rounded-lg cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>Fútbol 11</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-muted rounded-lg cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>Fútbol 7</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-muted rounded-lg cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>Fútbol 5</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="services">Servicios Disponibles</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 bg-muted rounded-lg cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>Iluminación</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-muted rounded-lg cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>Estacionamiento</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-muted rounded-lg cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>Vestuarios</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-muted rounded-lg cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>Cafetería</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea 
              id="description" 
              placeholder="Describe tu complejo deportivo..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
            Atrás
          </Button>
          <Button onClick={handleStep2} className="flex-1 h-12 bg-[#289B5F] hover:bg-[#289B5F]/90">
            Completar Registro
          </Button>
        </div>
      </div>
    </div>
  );
}
