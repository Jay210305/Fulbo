import { prisma } from '../config/prisma';

interface CreateBookingDto {
  userId: string;
  fieldId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  totalPrice: number;
  paymentMethod?: string;
}

export class BookingService {
  static async createBooking(data: CreateBookingDto) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    // 1. Validar Disponibilidad (Crucial para evitar doble reserva)
    // Buscamos cualquier reserva que se solape en tiempo para esa cancha
    const overlap = await prisma.bookings.findFirst({
      where: {
        field_id: data.fieldId,
        status: { not: 'cancelled' }, // Ignoramos las canceladas
        OR: [
          {
            // La nueva empieza dentro de una existente
            start_time: { lte: start },
            end_time: { gt: start },
          },
          {
            // La nueva termina dentro de una existente
            start_time: { lt: end },
            end_time: { gte: end },
          },
          {
            // La nueva engloba completamente a una existente
            start_time: { gte: start },
            end_time: { lte: end },
          },
        ],
      },
    });

    if (overlap) {
      throw new Error('HORARIO_OCUPADO');
    }

    // 2. Transacción Atómica: Reserva + Pago Simulado
    const result = await prisma.$transaction(async (tx) => {
      // A. Crear la Reserva
      const newBooking = await tx.bookings.create({
        data: {
          player_id: data.userId,
          field_id: data.fieldId,
          start_time: start,
          end_time: end,
          total_price: data.totalPrice,
          status: 'confirmed', // Asumimos confirmado porque el pago es "exitoso"
        },
      });

      // B. Crear el Pago (Simulación de éxito)
      await tx.payments.create({
        data: {
          booking_id: newBooking.booking_id,
          amount: data.totalPrice,
          status: 'succeeded', // ¡Aquí está la "magia" del desarrollo!
          payment_gateway_id: `SIMULADO_${Date.now()}_${data.paymentMethod || 'EFECTIVO'}`,
        },
      });

      return newBooking;
    });

    return result;
  }
}