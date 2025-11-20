import { useState } from "react";
import { ArrowLeft, Building2, FileText, Bell, Check, Link2, CreditCard, BarChart3 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface BusinessSettingsScreenProps {
  onBack: () => void;
}

export function BusinessSettingsScreen({ onBack }: BusinessSettingsScreenProps) {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  // Business data state
  const [businessData, setBusinessData] = useState({
    businessName: 'Canchitas La Merced S.A.C.',
    ruc: '20123456789',
    address: 'Av. Principal 123, Tahuaycani, Juliaca',
    phone: '+51 987 654 321',
    email: 'contacto@lamerced.com'
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    newReservations: true,
    cancellations: true,
    paymentReceived: true,
    lowInventory: false,
    customerReviews: true,
    weeklyReport: true,
    monthlyReport: true,
    marketingUpdates: false
  });

  // Integration settings
  const [integrations, setIntegrations] = useState({
    pos: false,
    accounting: false,
    analytics: false
  });

  const handleSaveBusinessData = () => {
    setShowSuccessDialog(true);
  };

  const handleSaveNotifications = () => {
    alert('Preferencias de notificaciones guardadas exitosamente');
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2>Ajustes de Cuenta</h2>
          <p className="text-sm text-muted-foreground">Configuración de negocio</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Business Data Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={20} className="text-[#047857]" />
            <h3>Datos de Facturación</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Razón Social *</Label>
              <Input
                id="businessName"
                value={businessData.businessName}
                onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                placeholder="Nombre de la empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ruc">RUC *</Label>
              <Input
                id="ruc"
                value={businessData.ruc}
                onChange={(e) => setBusinessData({ ...businessData, ruc: e.target.value })}
                placeholder="20123456789"
                maxLength={11}
              />
              <p className="text-xs text-muted-foreground">
                Número de RUC de 11 dígitos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección Fiscal *</Label>
              <Input
                id="address"
                value={businessData.address}
                onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                placeholder="Dirección completa"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={businessData.phone}
                  onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                  placeholder="+51 987 654 321"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={businessData.email}
                  onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                  placeholder="contacto@empresa.com"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveBusinessData}
              className="w-full bg-[#047857] hover:bg-[#047857]/90"
            >
              Guardar Datos de Facturación
            </Button>
          </div>
        </div>

        <Separator />

        {/* Integrations Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Link2 size={20} className="text-[#047857]" />
            <h3>Integraciones</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Conecta Fulbo con otros servicios para automatizar tu negocio
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <CreditCard size={20} className="text-[#047857]" />
                </div>
                <div>
                  <p className="text-sm">Terminal Punto de Venta (TPV)</p>
                  <p className="text-xs text-muted-foreground">Conecta tu terminal de pagos físico</p>
                </div>
              </div>
              <Switch
                checked={integrations.pos}
                onCheckedChange={(checked) => setIntegrations({ ...integrations, pos: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <FileText size={20} className="text-[#047857]" />
                </div>
                <div>
                  <p className="text-sm">Sistema de Contabilidad</p>
                  <p className="text-xs text-muted-foreground">Exporta facturas y reportes automáticamente</p>
                </div>
              </div>
              <Switch
                checked={integrations.accounting}
                onCheckedChange={(checked) => setIntegrations({ ...integrations, accounting: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <BarChart3 size={20} className="text-[#047857]" />
                </div>
                <div>
                  <p className="text-sm">Analíticas Avanzadas</p>
                  <p className="text-xs text-muted-foreground">Google Analytics y reportes detallados</p>
                </div>
              </div>
              <Switch
                checked={integrations.analytics}
                onCheckedChange={(checked) => setIntegrations({ ...integrations, analytics: checked })}
              />
            </div>
          </div>

          <div className="bg-secondary rounded-lg p-4 mt-4">
            <p className="text-sm">
              <strong>Próximamente:</strong> Más integraciones como WhatsApp Business, Mercado Pago, y sistemas de facturación electrónica.
            </p>
          </div>
        </div>

        <Separator />

        {/* Notifications Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-[#047857]" />
            <h3>Notificaciones</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Controla qué alertas y notificaciones deseas recibir
          </p>

          <div className="space-y-4">
            {/* Reservations & Bookings */}
            <div>
              <h4 className="mb-3">Reservas y Pagos</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm">Nuevas Reservas</p>
                    <p className="text-xs text-muted-foreground">Notificación instantánea cuando llega una reserva</p>
                  </div>
                  <Switch
                    checked={notifications.newReservations}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newReservations: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm">Cancelaciones</p>
                    <p className="text-xs text-muted-foreground">Alerta cuando un cliente cancela una reserva</p>
                  </div>
                  <Switch
                    checked={notifications.cancellations}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, cancellations: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm">Pagos Recibidos</p>
                    <p className="text-xs text-muted-foreground">Confirmación cuando se procesa un pago</p>
                  </div>
                  <Switch
                    checked={notifications.paymentReceived}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, paymentReceived: checked })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Inventory & Reviews */}
            <div>
              <h4 className="mb-3">Inventario y Reseñas</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm">Inventario Bajo</p>
                    <p className="text-xs text-muted-foreground">Alerta cuando productos están por agotarse</p>
                  </div>
                  <Switch
                    checked={notifications.lowInventory}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, lowInventory: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm">Reseñas de Clientes</p>
                    <p className="text-xs text-muted-foreground">Notificación cuando recibas una nueva reseña</p>
                  </div>
                  <Switch
                    checked={notifications.customerReviews}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, customerReviews: checked })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Reports */}
            <div>
              <h4 className="mb-3">Reportes Periódicos</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm">Reporte Semanal</p>
                    <p className="text-xs text-muted-foreground">Resumen de ingresos y reservas cada lunes</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm">Reporte Mensual</p>
                    <p className="text-xs text-muted-foreground">Análisis completo al inicio de cada mes</p>
                  </div>
                  <Switch
                    checked={notifications.monthlyReport}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, monthlyReport: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm">Actualizaciones de Marketing</p>
                    <p className="text-xs text-muted-foreground">Tips y consejos para mejorar tu negocio</p>
                  </div>
                  <Switch
                    checked={notifications.marketingUpdates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, marketingUpdates: checked })}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleSaveNotifications}
              className="w-full bg-[#047857] hover:bg-[#047857]/90"
            >
              Guardar Preferencias
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Importante:</strong> Los datos de facturación son necesarios para generar comprobantes electrónicos válidos según la normativa SUNAT.
          </p>
        </div>
      </div>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#dcfce7] flex items-center justify-center">
              <Check size={32} className="text-[#047857]" />
            </div>
            <AlertDialogTitle className="text-center">Datos Guardados</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Los datos de facturación han sido actualizados exitosamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowSuccessDialog(false)}
              className="w-full bg-[#047857] hover:bg-[#047857]/90"
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
