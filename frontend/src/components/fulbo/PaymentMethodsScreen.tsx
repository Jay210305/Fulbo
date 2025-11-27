import { useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
} from "lucide-react";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { useCart } from "../../contexts/CartContext";
import { useMatches } from "../../contexts/MatchesContext";

interface PaymentMethodsScreenProps {
  matchName: string;
  onBack: () => void;
  onPaymentComplete: (matchName: string) => void;
}

const paymentMethods = [
  {
    id: "visa",
    name: "Tarjeta Visa",
    icon: CreditCard,
    description: "Débito o crédito",
  },
  {
    id: "mastercard",
    name: "Tarjeta Mastercard",
    icon: CreditCard,
    description: "Débito o crédito",
  },
  {
    id: "yape",
    name: "Yape",
    icon: Smartphone,
    description: "Pago instantáneo",
  },
  {
    id: "plin",
    name: "Plin",
    icon: Smartphone,
    description: "Pago instantáneo",
  },
  {
    id: "transferencia",
    name: "Transferencia Bancaria",
    icon: Building2,
    description: "BCP, Interbank, BBVA",
  },
  {
    id: "efectivo",
    name: "Efectivo",
    icon: Wallet,
    description: "Pagar en la cancha",
  },
];

export function PaymentMethodsScreen({
  matchName,
  onBack,
  onPaymentComplete,
}: PaymentMethodsScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const { cart, getCartTotal, getFieldTotal, clearCart } = useCart();
  const { addMatch, addChat } = useMatches();

  const grandTotal = getFieldTotal() + getCartTotal();

  const handlePay = async () => {
    if (!selectedMethod || !cart.field || !cart.selectedTime) return;

    setLoading(true);

    try {
      // 1. Preparar fechas para el Backend
      // Asumimos que la reserva es para "Hoy" si no hay fecha específica
      const now = new Date();
      const [hours, minutes] = cart.selectedTime.split(":").map(Number);

      const startTime = new Date(now);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + (cart.duration || 1));

      // 2. Obtener token (asumiendo que Dev A ya implementó el login y guardó el token)
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Debes iniciar sesión para reservar");
        setLoading(false);
        return;
      }

      // 3. Llamada a la API
      const response = await fetch("http://localhost:4000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fieldId: cart.field.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          totalPrice: grandTotal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al procesar la reserva");
      }

      // 4. ÉXITO: Actualizar estado local (Contexts)
      const newMatch = {
        id: data.booking_id, // Usar ID real del backend
        name: matchName,
        fieldName: cart.field.name,
        location: cart.field.location,
        date: startTime.toLocaleDateString(),
        time: cart.selectedTime,
        duration: cart.duration || 1,
        type: cart.field.type || "Fútbol 7v7",
        status: "upcoming" as const,
        players: 1,
        maxPlayers: 14,
        hasRival: false,
        chatId: `chat-${data.booking_id}`,
        isPending: false,
      };

      addMatch(newMatch);

      const newChat = {
        id: newMatch.chatId,
        matchId: newMatch.id,
        matchName: matchName,
        lastMessage: "¡Reserva confirmada por el sistema!",
        lastMessageTime: "Ahora",
        unreadCount: 0,
        isPermanent: true,
      };

      addChat(newChat);

      // Limpiar carrito y finalizar
      clearCart();
      onPaymentComplete(matchName);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>Método de Pago</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Resumen del monto */}
        <div className="bg-gradient-to-r from-[#047857] to-[#10b981] rounded-xl p-6 text-white">
          <p className="text-sm text-white/80 mb-2">Total a Pagar</p>
          <p className="text-3xl">S/ {grandTotal.toFixed(2)}</p>
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm text-white/90">Partido: {matchName}</p>
            {cart.field && (
              <p className="text-sm text-white/90">
                {cart.field.name} - {cart.selectedTime}
              </p>
            )}
          </div>
        </div>

        {/* Métodos de Pago */}
        <div>
          <h3 className="mb-4">Selecciona tu método de pago</h3>
          <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div
                    key={method.id}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? "border-[#047857] bg-secondary"
                        : "border-border hover:border-muted-foreground"
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          selectedMethod === method.id
                            ? "bg-[#047857] text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon size={24} />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={method.id} className="cursor-pointer">
                          {method.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {method.description}
                        </p>
                      </div>
                      <RadioGroupItem value={method.id} id={method.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </div>

        {/* Información de seguridad */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            🔒 Tu pago está protegido con encriptación de nivel bancario
          </p>
        </div>
      </div>

      {/* Footer Sticky */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 shadow-lg">
        <Button
          onClick={handlePay}
          disabled={!selectedMethod || loading}
          className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90 disabled:opacity-50"
        >
          {loading
            ? "Procesando..."
            : selectedMethod
            ? `Pagar S/ ${grandTotal.toFixed(2)}`
            : "Selecciona un método de pago"}
        </Button>
      </div>
    </div>
  );
}
