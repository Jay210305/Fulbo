import { ArrowLeft, Camera, ChevronRight, Bell, BellOff, CreditCard, History, Users, HelpCircle, FileText, LogOut, User, MapPin, Award, Phone, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { PhoneVerificationModal } from "./PhoneVerificationModal";
import { useUser } from "../../contexts/UserContext";

interface ProfileSettingsScreenProps {
  onBack: () => void;
}

export function ProfileSettingsScreen({ onBack }: ProfileSettingsScreenProps) {
  const { user, updateUser } = useUser();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [profile, setProfile] = useState({
    name: user.name,
    position: user.position || 'Delantero',
    level: 'Intermedio',
    bio: user.bio || 'Amante del fútbol, juego desde hace 10 años'
  });
  const [notifications, setNotifications] = useState({
    reservations: true,
    chats: true,
    promotions: false
  });

  const handlePhoneVerified = (phone: string) => {
    updateUser({ phone, phoneVerified: true });
    setShowPhoneModal(false);
  };

  if (activeSection === 'profile') {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
          <button onClick={() => setActiveSection(null)} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h2>Mi Perfil</h2>
        </div>

        <div className="p-4 space-y-6">
          {/* Foto de Perfil */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-[#047857] text-white text-3xl">
                  {profile.name.charAt(0)}
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
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="mt-2"
            />
          </div>

          {/* Posición */}
          <div>
            <Label htmlFor="position">Posición Preferida</Label>
            <Select value={profile.position} onValueChange={(value) => setProfile({ ...profile, position: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecciona tu posición" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Portero">Portero</SelectItem>
                <SelectItem value="Defensa">Defensa</SelectItem>
                <SelectItem value="Mediocampista">Mediocampista</SelectItem>
                <SelectItem value="Delantero">Delantero</SelectItem>
                <SelectItem value="Volante">Volante</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nivel de Juego */}
          <div>
            <Label htmlFor="level">Nivel de Juego</Label>
            <Select value={profile.level} onValueChange={(value) => setProfile({ ...profile, level: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecciona tu nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Principiante">Principiante</SelectItem>
                <SelectItem value="Intermedio">Intermedio</SelectItem>
                <SelectItem value="Avanzado">Avanzado</SelectItem>
                <SelectItem value="Profesional">Profesional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Biografía */}
          <div>
            <Label htmlFor="bio">Biografía (Opcional)</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Cuéntanos un poco sobre ti..."
              className="mt-2 min-h-[100px]"
            />
          </div>

          <Separator />

          {/* Teléfono de Contacto */}
          <div>
            <Label>Teléfono de Contacto (Obligatorio)</Label>
            <div className="mt-2 border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Phone size={20} className="text-[#047857]" />
                  <span>{user.phone || 'No configurado'}</span>
                </div>
                {user.phoneVerified && (
                  <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                    <ShieldCheck size={12} className="mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Solo visible para administradores de canchas donde reserves
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowPhoneModal(true)}
              >
                {user.phone ? 'Cambiar Número' : 'Agregar Número'}
              </Button>
            </div>
          </div>

          <Button 
            className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
            onClick={() => {
              updateUser({ 
                name: profile.name, 
                position: profile.position,
                bio: profile.bio 
              });
              alert('Cambios guardados');
            }}
          >
            Guardar Cambios
          </Button>
        </div>

        {/* Phone Verification Modal */}
        <PhoneVerificationModal
          open={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          onVerified={handlePhoneVerified}
          isEditing={!!user.phone}
        />
      </div>
    );
  }

  if (activeSection === 'teams') {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
          <button onClick={() => setActiveSection(null)} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h2>Mis Equipos</h2>
        </div>

        <div className="p-4 space-y-4">
          <Button className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90">
            + Crear Nuevo Equipo
          </Button>

          <div className="space-y-3">
            <h3>Equipos donde participo (2)</h3>
            
            {[
              { name: 'Los Tigres FC', role: 'Capitán', members: 12 },
              { name: 'Amigos del Barrio', role: 'Miembro', members: 8 }
            ].map((team, index) => (
              <div key={index} className="border border-border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-[#047857] text-white">
                      {team.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4>{team.name}</h4>
                    <p className="text-sm text-muted-foreground">{team.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users size={14} />
                  <span>{team.members} miembros</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3>Solicitudes Pendientes (1)</h3>
            <div className="border border-amber-500 bg-amber-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-amber-500 text-white">
                    R
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4>Relámpagos FC</h4>
                  <p className="text-sm text-muted-foreground">Te invitó a unirte</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-[#047857] hover:bg-[#047857]/90">
                  Aceptar
                </Button>
                <Button variant="outline" className="flex-1">
                  Rechazar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'notifications') {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
          <button onClick={() => setActiveSection(null)} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h2>Notificaciones</h2>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-[#047857]" />
              <div>
                <p>Reservas</p>
                <p className="text-sm text-muted-foreground">Confirmaciones y recordatorios</p>
              </div>
            </div>
            <Switch
              checked={notifications.reservations}
              onCheckedChange={(checked) => setNotifications({ ...notifications, reservations: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-[#047857]" />
              <div>
                <p>Chats</p>
                <p className="text-sm text-muted-foreground">Mensajes de partidos y equipos</p>
              </div>
            </div>
            <Switch
              checked={notifications.chats}
              onCheckedChange={(checked) => setNotifications({ ...notifications, chats: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted">
            <div className="flex items-center gap-3">
              <BellOff size={20} className="text-muted-foreground" />
              <div>
                <p>Promociones</p>
                <p className="text-sm text-muted-foreground">Ofertas y descuentos especiales</p>
              </div>
            </div>
            <Switch
              checked={notifications.promotions}
              onCheckedChange={(checked) => setNotifications({ ...notifications, promotions: checked })}
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'history') {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
          <button onClick={() => setActiveSection(null)} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h2>Historial</h2>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <h3 className="mb-3">Reservas Anteriores</h3>
            <div className="space-y-3">
              {[
                { field: 'Canchita La Merced', date: '8 Oct 2024', price: 35 },
                { field: 'Estadio Zona Sur', date: '1 Oct 2024', price: 45 },
                { field: 'Cancha Los Pinos', date: '25 Sep 2024', price: 40 }
              ].map((booking, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4>{booking.field}</h4>
                    <span className="text-[#047857]">S/ {booking.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{booking.date}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3">Historial de Partidos</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-2xl text-[#047857] mb-1">24</p>
                <p className="text-xs text-muted-foreground">Partidos</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-2xl text-[#047857] mb-1">15</p>
                <p className="text-xs text-muted-foreground">Ganados</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-2xl text-[#047857] mb-1">9</p>
                <p className="text-xs text-muted-foreground">Perdidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'payments') {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
          <button onClick={() => setActiveSection(null)} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h2>Pagos</h2>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3>Métodos de Pago</h3>
              <Button variant="outline" size="sm">+ Agregar</Button>
            </div>
            <div className="space-y-3">
              <div className="border border-border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs">
                    VISA
                  </div>
                  <div>
                    <p>•••• 4532</p>
                    <p className="text-sm text-muted-foreground">Vence 12/25</p>
                  </div>
                </div>
                <ChevronRight size={20} />
              </div>

              <div className="border border-border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-purple-600 rounded flex items-center justify-center text-white text-xs">
                    YAPE
                  </div>
                  <div>
                    <p>923 456 789</p>
                    <p className="text-sm text-muted-foreground">Verificado</p>
                  </div>
                </div>
                <ChevronRight size={20} />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3">Historial de Transacciones</h3>
            <div className="space-y-3">
              {[
                { description: 'Canchita La Merced', date: '8 Oct 2024', amount: 35, status: 'Completado' },
                { description: 'Full Vaso - Agua', date: '8 Oct 2024', amount: 2, status: 'Completado' },
                { description: 'Estadio Zona Sur', date: '1 Oct 2024', amount: 45, status: 'Completado' }
              ].map((transaction, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p>{transaction.description}</p>
                    <span className="text-[#047857]">S/ {transaction.amount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    <span className="text-xs text-green-600">{transaction.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Settings Screen
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>Configuración de Perfil</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Mi Perfil */}
        <div>
          <h3 className="mb-3 text-muted-foreground text-sm">MI CUENTA</h3>
          <div className="space-y-1">
            <button
              onClick={() => setActiveSection('profile')}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <User size={20} className="text-[#047857]" />
                <span>Mi Perfil</span>
              </div>
              <ChevronRight size={20} />
            </button>

            <button
              onClick={() => setActiveSection('teams')}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users size={20} className="text-[#047857]" />
                <span>Mis Equipos</span>
              </div>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <Separator />

        {/* Preferencias */}
        <div>
          <h3 className="mb-3 text-muted-foreground text-sm">PREFERENCIAS</h3>
          <div className="space-y-1">
            <button
              onClick={() => setActiveSection('notifications')}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-[#047857]" />
                <span>Notificaciones</span>
              </div>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <Separator />

        {/* Actividad */}
        <div>
          <h3 className="mb-3 text-muted-foreground text-sm">ACTIVIDAD</h3>
          <div className="space-y-1">
            <button
              onClick={() => setActiveSection('history')}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <History size={20} className="text-[#047857]" />
                <span>Historial</span>
              </div>
              <ChevronRight size={20} />
            </button>

            <button
              onClick={() => setActiveSection('payments')}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-[#047857]" />
                <span>Pagos</span>
              </div>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <Separator />

        {/* General */}
        <div>
          <h3 className="mb-3 text-muted-foreground text-sm">GENERAL</h3>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle size={20} className="text-[#047857]" />
                <span>Ayuda y Soporte</span>
              </div>
              <ChevronRight size={20} />
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-[#047857]" />
                <span>Términos y Condiciones</span>
              </div>
              <ChevronRight size={20} />
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
              <div className="flex items-center gap-3">
                <LogOut size={20} />
                <span>Cerrar Sesión</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
