import { useState } from "react";
import { ArrowLeft, Camera, User, Mail, Lock, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

interface ManagerProfileSettingsProps {
  onBack: () => void;
}

export function ManagerProfileSettings({ onBack }: ManagerProfileSettingsProps) {
  const [activeView, setActiveView] = useState<'main' | 'personal' | 'password' | 'notifications'>('main');
  
  const [personalData, setPersonalData] = useState({
    name: 'Carlos Rodríguez',
    email: 'carlos@fulbo.com',
    phone: '+51 923 456 789'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    newReservations: true,
    cancelations: true,
    systemUpdates: false,
    promotions: true
  });

  const handleUpdatePersonalData = () => {
    alert('Datos personales actualizados');
    setActiveView('main');
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    alert('Contraseña actualizada exitosamente');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setActiveView('main');
  };

  const handleSaveNotifications = () => {
    alert('Preferencias de notificaciones guardadas');
    setActiveView('main');
  };

  if (activeView === 'personal') {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
          <button onClick={() => setActiveView('main')} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h2>Datos Personales</h2>
        </div>

        <div className="p-4 space-y-6">
          {/* Foto de Perfil */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-[#047857] text-white text-3xl">
                  {personalData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#047857] text-white rounded-full flex items-center justify-center hover:bg-[#047857]/90">
                <Camera size={16} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">Toca para cambiar foto</p>
          </div>

          {/* Nombre */}
          <div>
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              value={personalData.name}
              onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
              className="mt-2"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={personalData.email}
              onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
              className="mt-2"
            />
          </div>

          {/* Teléfono */}
          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={personalData.phone}
              onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
              className="mt-2"
            />
          </div>

          <Button 
            className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
            onClick={handleUpdatePersonalData}
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    );
  }

  if (activeView === 'password') {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
          <button onClick={() => setActiveView('main')} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h2>Cambiar Contraseña</h2>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <Label htmlFor="currentPassword">Contraseña Actual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">Mínimo 8 caracteres</p>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="mt-2"
            />
          </div>

          <Button 
            className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
            onClick={handleChangePassword}
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            Actualizar Contraseña
          </Button>
        </div>
      </div>
    );
  }

  if (activeView === 'notifications') {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
          <button onClick={() => setActiveView('main')} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h2>Notificaciones de Cuenta</h2>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-[#047857]" />
              <div>
                <p>Nuevas Reservas</p>
                <p className="text-sm text-muted-foreground">Recibe alertas de nuevas reservas</p>
              </div>
            </div>
            <Switch
              checked={notifications.newReservations}
              onCheckedChange={(checked: boolean) => setNotifications({ ...notifications, newReservations: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-[#047857]" />
              <div>
                <p>Cancelaciones</p>
                <p className="text-sm text-muted-foreground">Alertas de reservas canceladas</p>
              </div>
            </div>
            <Switch
              checked={notifications.cancelations}
              onCheckedChange={(checked: boolean) => setNotifications({ ...notifications, cancelations: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-[#047857]" />
              <div>
                <p>Actualizaciones del Sistema</p>
                <p className="text-sm text-muted-foreground">Noticias y mejoras de la app</p>
              </div>
            </div>
            <Switch
              checked={notifications.systemUpdates}
              onCheckedChange={(checked: boolean) => setNotifications({ ...notifications, systemUpdates: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-[#047857]" />
              <div>
                <p>Promociones y Tips</p>
                <p className="text-sm text-muted-foreground">Consejos para mejorar tu negocio</p>
              </div>
            </div>
            <Switch
              checked={notifications.promotions}
              onCheckedChange={(checked: boolean) => setNotifications({ ...notifications, promotions: checked })}
            />
          </div>
        </div>

        <div className="p-4">
          <Button 
            className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
            onClick={handleSaveNotifications}
          >
            Guardar Preferencias
          </Button>
        </div>
      </div>
    );
  }

  // Main view
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>Configuración General</h2>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <h3 className="mb-3 text-muted-foreground text-sm">CONFIGURACIÓN DEL MANAGER</h3>
          <div className="space-y-1">
            <button
              onClick={() => setActiveView('personal')}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <User size={20} className="text-[#047857]" />
                <span>Datos Personales</span>
              </div>
              <span className="text-muted-foreground">›</span>
            </button>

            <button
              onClick={() => setActiveView('password')}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock size={20} className="text-[#047857]" />
                <span>Cambiar Contraseña</span>
              </div>
              <span className="text-muted-foreground">›</span>
            </button>

            <button
              onClick={() => setActiveView('notifications')}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-[#047857]" />
                <span>Notificaciones de Cuenta</span>
              </div>
              <span className="text-muted-foreground">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
