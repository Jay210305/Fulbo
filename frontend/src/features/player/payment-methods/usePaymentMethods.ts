import { useState, useCallback } from 'react';
import { useCart } from '../../../contexts/CartContext';
import { useMatches } from '../../../contexts/MatchesContext';
import { BookingPayload, BookingResponse, NewMatch, NewChat } from './types';

interface UsePaymentMethodsProps {
  matchName: string;
  onPaymentComplete: (matchName: string) => void;
}

export function usePaymentMethods({ matchName, onPaymentComplete }: UsePaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { cart, getCartTotal, getFieldTotal, clearCart } = useCart();
  const { addMatch, addChat } = useMatches();

  const grandTotal = getFieldTotal() + getCartTotal();

  const handlePay = useCallback(async () => {
    if (!selectedMethod || !cart.field || !cart.selectedTime) return;

    setLoading(true);

    try {
      // 1. Preparar fechas para el Backend
      const now = new Date();
      const [hours, minutes] = cart.selectedTime.split(':').map(Number);

      const startTime = new Date(now);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + (cart.duration || 1));

      // 2. Obtener token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Debes iniciar sesión para reservar');
        setLoading(false);
        return;
      }

      // 3. Preparar payload
      const payload: BookingPayload = {
        fieldId: cart.field.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalPrice: grandTotal,
        paymentMethod: selectedMethod,
        matchName: matchName,
      };

      // 4. Llamada a la API
      const response = await fetch('http://localhost:4000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data: BookingResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la reserva');
      }

      // 5. ÉXITO: Actualizar estado local (Contexts)
      const newMatch: NewMatch = {
        id: data.booking_id,
        name: matchName,
        fieldName: cart.field.name,
        location: cart.field.location,
        date: startTime.toLocaleDateString(),
        time: cart.selectedTime,
        duration: cart.duration || 1,
        type: cart.field.type || 'Fútbol 7v7',
        status: 'upcoming',
        players: 1,
        maxPlayers: 14,
        hasRival: false,
        chatId: data.booking_id,
        isPending: false,
      };

      addMatch(newMatch);

      const newChat: NewChat = {
        id: newMatch.chatId,
        matchId: newMatch.id,
        matchName: matchName,
        lastMessage: '¡Reserva confirmada! Invita a tus amigos.',
        lastMessageTime: 'Ahora',
        unreadCount: 0,
        isPermanent: true,
      };

      addChat(newChat);

      // Limpiar carrito y finalizar
      clearCart();
      onPaymentComplete(matchName);
    } catch (error: unknown) {
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  }, [selectedMethod, cart, grandTotal, matchName, addMatch, addChat, clearCart, onPaymentComplete]);

  const canPay = selectedMethod && !loading;

  return {
    // State
    selectedMethod,
    loading,
    grandTotal,
    cart,
    
    // Actions
    setSelectedMethod,
    handlePay,
    
    // Computed
    canPay,
  };
}
