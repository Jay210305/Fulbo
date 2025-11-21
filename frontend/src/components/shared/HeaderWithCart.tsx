import { ShoppingCart } from "lucide-react";
import { Badge } from "../ui/badge";
import { useCart } from "../../contexts/CartContext";

interface HeaderWithCartProps {
  title: string;
  onCartClick: () => void;
}

export function HeaderWithCart({ title, onCartClick }: HeaderWithCartProps) {
  const { getTotalItems, cart } = useCart();
  const totalItems = getTotalItems();
  const hasReservation = cart.field && cart.selectedTime;

  return (
    <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between z-10">
      <h1 className="text-2xl">{title}</h1>
      
      {hasReservation && (
        <button
          onClick={onCartClick}
          className="relative p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ShoppingCart size={24} className="text-[#289B5F]" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {totalItems}
            </Badge>
          )}
        </button>
      )}
    </div>
  );
}
