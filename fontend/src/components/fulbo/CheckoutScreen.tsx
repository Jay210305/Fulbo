import { useState } from "react";
import { ArrowLeft, MapPin, Clock, Calendar, Plus, Minus, AlertCircle, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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

interface CheckoutScreenProps {
  onBack: () => void;
  onContinueToPayment: (matchName: string) => void;
  onPayLater: (matchName: string) => void;
  onCancel: () => void;
}

export function CheckoutScreen({ onBack, onContinueToPayment, onPayLater, onCancel }: CheckoutScreenProps) {
  const { cart, updateQuantity, getCartTotal, getFieldTotal, cancelReservation } = useCart();
  const [matchName, setMatchName] = useState('');
  const [error, setError] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleContinue = () => {
    if (!matchName.trim()) {
      setError('Por favor ingresa un nombre para tu partido');
      return;
    }
    onContinueToPayment(matchName);
  };

  const handlePayLater = () => {
    if (!matchName.trim()) {
      setError('Por favor ingresa un nombre para tu partido');
      return;
    }
    onPayLater(matchName);
  };

  if (!cart.field || !cart.selectedTime) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="mb-2">No hay reserva en proceso</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Selecciona una cancha y horario para continuar
          </p>
          <Button onClick={onBack}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  const fieldTotal = getFieldTotal();
  const productsTotal = getCartTotal();
  const grandTotal = fieldTotal + productsTotal;

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>Finalizar Reserva</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Detalle de la Reserva - Cancha */}
        <div>
          <h3 className="mb-3">Detalle de la Reserva</h3>
          <div className="border border-border rounded-xl p-4">
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
                    <span>{cart.selectedTime} • {cart.duration}h</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Precio</p>
                <p className="text-lg text-[#047857]">S/ {fieldTotal.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {cart.duration === 1 ? '1 hora' : `${cart.duration} horas`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Productos Adicionales */}
        {cart.items.length > 0 && (
          <div>
            <h3 className="mb-3">Productos Adicionales</h3>
            <div className="space-y-3">
              {cart.items.map(item => (
                <div key={item.product.id} className="border border-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <ImageWithFallback
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="mb-1">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{item.product.description}</p>
                      <p className="text-sm text-muted-foreground">S/ {item.product.price.toFixed(2)} c/u</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full bg-[#047857] text-white flex items-center justify-center hover:bg-[#047857]/90"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-sm">S/ {(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nombre del Partido */}
        <div>
          <h3 className="mb-3">Nombra tu Partido</h3>
          <div className="border border-border rounded-xl p-4 space-y-3">
            <div>
              <Label htmlFor="match-name">Nombre del Partido *</Label>
              <Input
                id="match-name"
                placeholder="Ej: Mi pichanga del viernes, Clásico semanal"
                value={matchName}
                onChange={(e) => {
                  setMatchName(e.target.value);
                  setError('');
                }}
                className={`mt-2 ${error ? 'border-red-500' : ''}`}
              />
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                💬 Se creará automáticamente un chat con este nombre donde podrás coordinar con tus amigos
              </p>
            </div>
          </div>
        </div>

        {/* Resumen de Pago */}
        <div>
          <h3 className="mb-3">Resumen de Pago</h3>
          <div className="border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cancha ({cart.selectedTime})</span>
              <span>S/ {fieldTotal.toFixed(2)}</span>
            </div>
            {productsTotal > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Productos ({cart.items.length})</span>
                <span>S/ {productsTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-3 flex items-center justify-between">
              <span>Total a Pagar</span>
              <span className="text-2xl text-[#047857]">S/ {grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Sticky */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 shadow-lg space-y-3">
        <Button
          onClick={handleContinue}
          className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
        >
          Ir a Pagar
        </Button>
        <div className="flex gap-3">
          <button
            onClick={handlePayLater}
            className="flex-1 text-center text-[#047857] hover:underline py-2"
          >
            Pagar Después (15 min)
          </button>
          <button
            onClick={() => setShowCancelDialog(true)}
            className="flex-1 text-center text-red-500 hover:underline py-2"
          >
            Cancelar Reserva
          </button>
        </div>
      </div>

      {/* Dialog de Confirmación de Cancelación */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar Reserva?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <div>
                  ¿Estás seguro que deseas cancelar esta reserva?
                </div>
                <div className="text-red-600">
                  Se perderán todos los productos seleccionados y el horario elegido.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Continuar con la Reserva</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                cancelReservation();
                setShowCancelDialog(false);
                onCancel();
              }}
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
