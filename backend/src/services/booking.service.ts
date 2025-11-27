import { prisma } from '../config/prisma';

export class BookingService {
  static async create(userId: string, data: { fieldId: string, startTime: string, endTime: string, totalPrice: number }) {
    
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    // 1. Verificar disponibilidad (Lógica de Negocio)
    // Buscamos si existe alguna reserva CONFIRMADA o PENDIENTE que se solape
    const overlappingBooking = await prisma.bookings.findFirst({
      where: {
        field_id: data.fieldId,
        status: { in: ['confirmed', 'pending'] }, // Si está cancelada, no importa
        OR: [
          {
            // Caso: La nueva reserva empieza dentro de una existente
            start_time: { lt: end },
            end_time: { gt: start }
          }
        ]
      }
    });

    if (overlappingBooking) {
      throw new Error('HORARIO_OCUPADO');
    }

    // 2. Crear Reserva y Pago en una transacción atómica (ACID)
    // Si falla el pago, no se crea la reserva, y viceversa.
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Crear Reserva
      const newBooking = await tx.bookings.create({
        data: {
          player_id: userId,
          field_id: data.fieldId,
          start_time: start,
          end_time: end,
          total_price: data.totalPrice,
          status: 'confirmed' // O 'pending' si integras pasarela real luego
        }
      });

      // B. Crear Registro de Pago (Simulado por ahora)
      await tx.payments.create({
        data: {
          booking_id: newBooking.booking_id,
          amount: data.totalPrice,
          status: 'succeeded', // Simulamos éxito inmediato
          payment_gateway_id: 'SIMULATED_' + Date.now()
        }
      });

      return newBooking;
    });

    return result;
  }
}