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
  const [isLoading, setIsLoading] = useState(false);

  // Estados para capturar los datos del formulario
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    docType: "",
    docNumber: "",
    city: "",
    district: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStep1 = () => {
    // Validación simple del paso 1
    if (!formData.firstName || !formData.lastName) {
      alert("Por favor completa tu nombre y apellido");
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    // Validaciones del paso 2
    if (!formData.email || !formData.password) {
      alert("Correo y contraseña son obligatorios");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      // 1. CONEXIÓN CON BACKEND (Puerto 4000)
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phone,
          documentType: formData.docType,
          documentNumber: formData.docNumber,
          city: formData.city,
          district: formData.district
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      // 2. GUARDAR SESIÓN (Formateando datos para el Frontend)
      const userForFrontend = {
        ...data.user,
        // Unimos nombres para el perfil
        name: `${data.user.first_name} ${data.user.last_name}`,
        email: data.user.email,
        phone: data.user.phone_number || '',
        phoneVerified: !!data.user.phone_number
      };

      // Guardar token si el backend lo devuelve (opcional en registro, vital en login)
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      localStorage.setItem('user', JSON.stringify(userForFrontend));

      // 3. ÉXITO
      setShowSuccess(true);
      
      setTimeout(() => {
        onRegister();
        window.location.reload(); // Recargar para actualizar contexto
      }, 2000);

    } catch (error: any) {
      console.error("Error de registro:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#289B5F] flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6">
          <CheckCircle2 size={80} className="text-white mx-auto" />
          <div className="space-y-2">
            <Logo variant="white" size="lg" />
            <p className="text-white text-xl">REGISTRO EXITOSO</p>
            <p className="text-white/80 text-sm">Bienvenido a Fulbo</p>
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
              <Input 
                id="firstName" 
                placeholder="Ingresa tus nombres" 
                className="h-12"
                value={formData.firstName}
                onChange={(e) => updateFormData("firstName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input 
                id="lastName" 
                placeholder="Ingresa tus apellidos" 
                className="h-12"
                value={formData.lastName}
                onChange={(e) => updateFormData("lastName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="docType">Tipo de documento</Label>
              <Select onValueChange={(val: string) => updateFormData("docType", val)}>
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
              <Input 
                id="docNumber" 
                placeholder="Número de documento" 
                className="h-12"
                value={formData.docNumber}
                onChange={(e) => updateFormData("docNumber", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Select onValueChange={(val: string) => updateFormData("city", val)}>
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
              <Select onValueChange={(val: string) => updateFormData("district", val)}>
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

             <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (Opcional)</Label>
              <Input 
                id="phone" 
                placeholder="987 654 321" 
                className="h-12"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
              />
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
            <Input 
              id="email" 
              type="email" 
              placeholder="ejemplo@correo.com" 
              className="h-12"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              className="h-12"
              value={formData.password}
              onChange={(e) => updateFormData("password", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="••••••••" 
              className="h-12"
              value={formData.confirmPassword}
              onChange={(e) => updateFormData("confirmPassword", e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
            Atrás
          </Button>
          <Button 
            onClick={handleRegister} 
            className="flex-1 h-12 bg-[#289B5F] hover:bg-[#289B5F]/90"
            disabled={isLoading}
          >
            {isLoading ? "Registrando..." : "Registrarse"}
          </Button>
        </div>
      </div>
    </div>
  );
}