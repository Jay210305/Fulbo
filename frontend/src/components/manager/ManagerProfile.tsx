import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  Settings,
  Calendar,
  MapPin,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
  Zap,
  ArrowLeftRight,
  Users,
  Plus,
  Mail,
  X,
  Building2,
  Bell,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { StaffManagementScreen } from "./StaffManagementScreen";
import { BusinessSettingsScreen } from "./BusinessSettingsScreen";
import { ManagerProfileSettings } from "./ManagerProfileSettings";
import { PaymentCollectionSettings } from "./PaymentCollectionSettings";
import { HelpSupportScreen } from "./HelpSupportScreen";
import { useUser } from "../../contexts/UserContext";
import { managerApi } from "../../services/manager.api";

interface ManagerProfileProps {
  isOwner: boolean;
  currentMode: 'player' | 'manager';
  onSwitchMode: () => void;
}

// Note: These boost plans are static/configuration data - would come from backend in production
const boostPlans = [
  {
    id: 1,
    name: 'Plan Diario',
    price: 15,
    duration: '24 horas',
    benefits: ['Destacado en búsquedas', '+50% visibilidad']
  },
  {
    id: 2,
    name: 'Plan Semanal',
    price: 25,
    duration: '7 días',
    popular: true,
    benefits: ['Destacado premium', 'Prioridad en resultados', 'Badge especial', '+100% visibilidad']
  },
  {
    id: 3,
    name: 'Plan Mensual',
    price: 80,
    duration: '30 días',
    benefits: ['Máxima prioridad', 'Analíticas avanzadas', 'Soporte prioritario', '+200% visibilidad']
  }
];

interface ManagerStats {
  totalFields: number;
  totalBookings: number;
  // totalRevenue would need a backend endpoint
}

export function ManagerProfile({ isOwner, currentMode, onSwitchMode }: ManagerProfileProps) {
  const { user, logout } = useUser();
  const [showStaffManagement, setShowStaffManagement] = useState(false);
  const [showBusinessSettings, setShowBusinessSettings] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);
  const [showHelpSupport, setShowHelpSupport] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [stats, setStats] = useState<ManagerStats>({ totalFields: 0, totalBookings: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const fields = await managerApi.fields.getAll();
        const totalBookings = fields.reduce((acc, f) => acc + f.stats.bookingsCount, 0);
        setStats({
          totalFields: fields.length,
          totalBookings
        });
      } catch (err) {
        console.error('Error fetching manager stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
    // Navigation will be handled by the app when user context changes
  };

  if (showStaffManagement) {
    return <StaffManagementScreen onBack={() => setShowStaffManagement(false)} />;
  }

  if (showBusinessSettings) {
    return <BusinessSettingsScreen onBack={() => setShowBusinessSettings(false)} />;
  }

  if (showProfileSettings) {
    return <ManagerProfileSettings onBack={() => setShowProfileSettings(false)} />;
  }

  if (showPaymentSettings) {
    return <PaymentCollectionSettings onBack={() => setShowPaymentSettings(false)} />;
  }

  if (showHelpSupport) {
    return <HelpSupportScreen onBack={() => setShowHelpSupport(false)} />;
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">Perfil Manager</h1>
          <Button
            onClick={onSwitchMode}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeftRight size={16} />
            <span>Modo Jugador</span>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-[#047857] text-white text-2xl">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="mb-1">{user?.name || 'Usuario'}</h2>
            <p className="text-sm text-muted-foreground mb-2">{user?.email || ''}</p>
            <div className="flex gap-2">
              <Badge className="bg-[#047857] hover:bg-[#047857]/90 text-white border-none">
                <Shield size={12} className="mr-1" />
                Verificado
              </Badge>
              <Badge className="bg-amber-500 hover:bg-amber-500/90 text-white border-none">
                Premium
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3">Resumen de Cuenta</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-xl text-[#047857] mb-1">S/ --</p>
              <p className="text-xs text-muted-foreground">Ingresos Totales</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              {loadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#047857]" />
              ) : (
                <p className="text-xl text-[#047857] mb-1">{stats.totalBookings.toLocaleString()}</p>
              )}
              <p className="text-xs text-muted-foreground">Reservas Totales</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              {loadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#047857]" />
              ) : (
                <p className="text-xl text-[#047857] mb-1">{stats.totalFields}</p>
              )}
              <p className="text-xs text-muted-foreground">Canchas Activas</p>
            </div>
          </div>
        </div>

        {/* Management Options */}
        <div>
          <h3 className="mb-3">Gestión de Negocio</h3>
          <div className="space-y-2">
            <Button
              onClick={() => setShowStaffManagement(true)}
              variant="outline"
              className="w-full justify-start h-auto py-4"
            >
              <Users size={20} className="mr-3 text-[#047857]" />
              <div className="text-left flex-1">
                <p>Gestión de Empleados/Staff</p>
                <p className="text-xs text-muted-foreground">Administra tu equipo y permisos</p>
              </div>
            </Button>

            <Button
              onClick={() => setShowBusinessSettings(true)}
              variant="outline"
              className="w-full justify-start h-auto py-4"
            >
              <Building2 size={20} className="mr-3 text-[#047857]" />
              <div className="text-left flex-1">
                <p>Ajustes de Cuenta</p>
                <p className="text-xs text-muted-foreground">Datos de facturación y notificaciones</p>
              </div>
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={20} className="text-amber-500" />
            <h3>Planes de Impulso de Visibilidad</h3>
          </div>
          
          <div className="space-y-3">
            {boostPlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl p-4 border-2 ${
                  plan.popular ? 'border-[#047857] bg-secondary' : 'border-border'
                }`}
              >
                {plan.popular && (
                  <Badge className="mb-2 bg-[#047857] hover:bg-[#047857]/90 text-white border-none">
                    Más Popular
                  </Badge>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="mb-1">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.duration}</p>
                  </div>
                  <p className="text-2xl text-[#047857]">S/ {plan.price}</p>
                </div>
                <ul className="text-sm space-y-1 mb-3">
                  {plan.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#047857]"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-[#047857] hover:bg-[#047857]/90">
                  Activar Plan
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3">Información</h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <MapPin size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Ubicación</p>
                <p>Tahuaycani, Juliaca</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Calendar size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Miembro desde</p>
                <p>Marzo 2023</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start h-auto py-3"
            onClick={() => setShowProfileSettings(true)}
          >
            <Settings size={20} className="mr-3" />
            Configuración de Perfil
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start h-auto py-3"
            onClick={() => setShowPaymentSettings(true)}
          >
            <CreditCard size={20} className="mr-3" />
            Métodos de Pago
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start h-auto py-3"
            onClick={() => setShowHelpSupport(true)}
          >
            <HelpCircle size={20} className="mr-3" />
            Ayuda y Soporte
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut size={20} className="mr-3" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Logout Confirmation Dialog */}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro que deseas cerrar la sesión de tu cuenta de Manager?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleLogout}
                className="bg-destructive hover:bg-destructive/90"
              >
                Cerrar Sesión
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
