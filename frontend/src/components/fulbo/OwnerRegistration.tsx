import { useState } from "react";
import { Logo } from "../shared/Logo";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { CheckCircle2 } from "lucide-react";
import shieldLogo from '../../assets/2068dbd9380c484f3b804acfa0e6103786f83524.png';

interface OwnerRegistrationProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function OwnerRegistration({ onComplete, onCancel }: OwnerRegistrationProps) {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    ruc: '',
    address: '',
    phone: ''
  });

  const handleStep1 = () => {
    if (!formData.businessName || !formData.ruc) {
      alert('Por favor completa los datos del negocio');
      return;
    }
    setStep(2);
  };

  const handleCompleteRegistration = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // CONEXIÓN AL BACKEND REAL
      const response = await fetch('http://localhost:4000/api/users/promote-to-manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          ruc: formData.ruc,
          // En un sistema real, guardaríamos estos datos en una tabla 'businesses'
        }),
      });

      if (!response.ok) {
        throw new Error('Error al registrarse como dueño');
      }

      // Actualizar localStorage para reflejar el nuevo rol inmediatamente
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      savedUser.role = 'manager'; // Forzamos el rol en local
      localStorage.setItem('user', JSON.stringify(savedUser));

      // Mostrar éxito
      setShowSuccess(true);
      setTimeout(() => {
        onComplete();
        window.location.reload(); // Recargar para que la App vea el nuevo rol
      }, 2000);

    } catch (error) {
      console.error(error);
      alert('Hubo un error al procesar tu solicitud');
    } finally {
      setIsLoading(false);
    }
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
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ruc">RUC</Label>
              <Input 
                id="ruc" 
                placeholder="Número de RUC" 
                className="h-12" 
                value={formData.ruc}
                onChange={(e) => setFormData({...formData, ruc: e.target.value})}
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
           {/* Inputs visuales del paso 2 (no conectados a backend por ahora, solo el submit) */}
          <div className="space-y-2">
            <Label>Número de Canchas</Label>
            <Select><SelectTrigger className="h-12"><SelectValue placeholder="¿Cuántas canchas tienes?"/></SelectTrigger><SelectContent><SelectItem value="1">1</SelectItem></SelectContent></Select>
          </div>
          <div className="space-y-2">
             <Label>Descripción</Label>
             <Textarea placeholder="Describe tu complejo..."/>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
            Atrás
          </Button>
          <Button 
            onClick={handleCompleteRegistration} 
            disabled={isLoading}
            className="flex-1 h-12 bg-[#289B5F] hover:bg-[#289B5F]/90"
          >
            {isLoading ? 'Registrando...' : 'Completar Registro'}
          </Button>
        </div>
      </div>
    </div>
  );
}
