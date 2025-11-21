import { useEffect, useState } from "react";
import { Clock, X, ShoppingCart } from "lucide-react";

interface ReservationToastProps {
  show: boolean;
  onClose: () => void;
  onCartClick: () => void;
}

export function ReservationToast({ show, onClose, onCartClick }: ReservationToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-hide después de 8 segundos
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Esperar animación
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, onClose]);

  if (!show && !isVisible) return null;

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-[#289B5F] to-[#10b981] rounded-xl p-4 shadow-lg text-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="mb-1">Reserva Bloqueada por 15 Minutos</p>
            <p className="text-sm text-white/90">
              Tienes 15 minutos para finalizar o pagar la reserva.
            </p>
            <button
              onClick={onCartClick}
              className="mt-2 flex items-center gap-2 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ShoppingCart size={14} />
              Accede desde el carrito
            </button>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
