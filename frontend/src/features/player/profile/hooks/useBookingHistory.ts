import { useState, useEffect } from 'react';
import { BookingApi, PlayerBooking } from '../../../../services/api';

export interface BookingHistoryItem {
  id: string;
  field: string;
  address: string;
  date: string;
  time: string;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface MatchStats {
  total: number;
  won: number;
  lost: number;
}

interface UseBookingHistoryReturn {
  bookings: BookingHistoryItem[];
  stats: MatchStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function formatBookingDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatBookingTime(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const formatTime = (d: Date) => d.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function mapBookingToHistoryItem(booking: PlayerBooking): BookingHistoryItem {
  return {
    id: booking.booking_id,
    field: booking.fields.name,
    address: booking.fields.address,
    date: formatBookingDate(booking.start_time),
    time: formatBookingTime(booking.start_time, booking.end_time),
    price: Number(booking.total_price),
    status: booking.status
  };
}

export function useBookingHistory(): UseBookingHistoryReturn {
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: These stats would come from a separate endpoint or be calculated
  // For now, we calculate basic stats from bookings
  const [stats, setStats] = useState<MatchStats>({
    total: 0,
    won: 0,
    lost: 0
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await BookingApi.getUserBookings();
      const mappedBookings = data.map(mapBookingToHistoryItem);
      setBookings(mappedBookings);
      
      // Calculate basic stats from confirmed bookings
      const confirmedCount = data.filter(b => b.status === 'confirmed').length;
      setStats({
        total: confirmedCount,
        won: 0, // Would need match results tracking
        lost: 0
      });
    } catch (err) {
      console.error('Error fetching booking history:', err);
      setError('Error al cargar el historial de reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    stats,
    loading,
    error,
    refetch: fetchBookings
  };
}
