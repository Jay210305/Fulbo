import { useState, useEffect } from "react";
import { ArrowLeft, Clock, MapPin, Calendar, AlertTriangle, X } from "lucide-react";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useCart } from "../../contexts/CartContext";
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

interface PendingReservationCartProps {
  onBack: () => void;
  onContinueToPayment: () => void;
}

export function PendingReservationCart({ onBack, onContinueToPayment }: PendingReservationCartProps) {
  const { cart, cancelReservation, getRemainingTime, getCartTotal, getFieldTotal } = useCart();
  const [remainingSeconds, setRemainingSeconds] = useState(getRemainingTime());
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getRemainingTime();
      setRemainingSeconds(remaining);
      
      if (remaining <= 0) {
        // Tiempo expirado - cancelar automáticamente
        cancelReservation();
        onBack();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getRemainingTime, cancelReservation, onBack]);

  const handleCancelConfirm = () => {
    cancelReservation();
    setShowCancelDialog(false);
    onBack();
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const fieldTotal = getFieldTotal();
  const productsTotal = getCartTotal();
  const grandTotal = fieldTotal + productsTotal;

  if (!cart.field || !cart.isPending) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>Reserva Pendiente</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Timer de Cuenta Regresiva */}
        <div className={`rounded-xl p-4 ${
          remainingSeconds < 300 ? 'bg-red-50 border-2 border-red-500' : 'bg-amber-50 border-2 border-amber-500'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              remainingSeconds < 300 ? 'bg-red-500' : 'bg-amber-500'
            }`}>
              <Clock size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className={remainingSeconds < 300 ? 'text-red-900' : 'text-amber-900'}>
                Tiempo para completar el pago
              </h3>
              <p className={`text-3xl mt-2 ${remainingSeconds < 300 ? 'text-red-600' : 'text-amber-600'}`}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </p>
              <p className={`text-sm mt-2 ${remainingSeconds < 300 ? 'text-red-700' : 'text-amber-700'}`}>
                {remainingSeconds < 300 
                  ? '⚠️ ¡Apúrate! Tu reserva está por expirar'
                  : 'Tu cancha está bloqueada temporalmente'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Detalle de la Reserva */}
        <div>
          <h3 className="mb-3">Detalle de tu Reserva</h3>
          <div className="border-2 border-[#047857] rounded-xl p-4">
            <div className="flex gap-3 mb-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <ImageWithFallback
                  src={cart.field.image}
                  alt={cart.field.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="mb-1">{cart.field.name}</h4>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <MapPin size={14} />
                  <span>{cart.field.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{cart.selectedDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{cart.selectedTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm text-muted-foreground mb-1">Nombre del Partido</p>
              <p>{cart.matchName}</p>
            </div>
          </div>
        </div>

        {/* Productos Adicionales */}
        {cart.items.length > 0 && (
          <div>
            <h3 className="mb-3">Productos Adicionales ({cart.items.length})</h3>
            <div className="space-y-2">
              {cart.items.map(item => (
                <div key={item.product.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      <ImageWithFallback
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm">S/ {(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumen Total */}
        <div className="border border-border rounded-xl p-4">
          <h3 className="mb-3">Resumen de Pago</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cancha</span>
              <span>S/ {fieldTotal.toFixed(2)}</span>
            </div>
            {productsTotal > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Productos</span>
                <span>S/ {productsTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex items-center justify-between">
              <span>Total a Pagar</span>
              <span className="text-2xl text-[#047857]">S/ {grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Advertencia */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900">
              <strong>Importante:</strong> Si no completas el pago antes de que expire el tiempo, 
              tu reserva será cancelada automáticamente y el horario quedará disponible para otros usuarios.
            </p>
          </div>
        </div>
      </div>

      {/* Footer con Acciones */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 shadow-lg space-y-3">
        <Button
          onClick={onContinueToPayment}
          className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
        >
          Finalizar Pago Ahora
        </Button>
        <Button
          onClick={() => setShowCancelDialog(true)}
          variant="outline"
          className="w-full h-12 text-red-500 border-red-500 hover:bg-red-50"
        >
          Cancelar Reserva
        </Button>
      </div>

      {/* Dialog de Confirmación de Cancelación */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar Reserva?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <div>
                  ¿Estás seguro que deseas cancelar tu reserva de <strong>{cart.field.name}</strong> para el{' '}
                  <strong>{cart.selectedDate}</strong> a las <strong>{cart.selectedTime}</strong>?
                </div>
                <div className="text-red-600">
                  El espacio será liberado inmediatamente para otros usuarios.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Sí, Cancelar Reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
