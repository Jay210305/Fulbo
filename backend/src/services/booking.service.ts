import { prisma } from '../config/prisma';
import ChatRoom from '../models/ChatRoom';
import { EmailService } from './email.service';
import { emitNewBooking, emitBookingCancelled } from '../sockets/booking.socket';
import { ScheduleBlockService } from './schedule-block.service';

interface CreateBookingDto {
  userId: string;
  fieldId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  totalPrice: number;
  paymentMethod?: string;
  matchName?: string;
}

export class BookingService {
  static async createBooking(data: CreateBookingDto) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    // 0. Check for schedule blocks (Maintenance, Personal closures, Events)
    const isBlocked = await ScheduleBlockService.isTimeSlotBlocked(data.fieldId, start, end);
    if (isBlocked) {
      throw new Error('HORARIO_BLOQUEADO');
    }

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

    // 3. Crear Sala de Chat en MongoDB (Sincronización)
    try {
      // Necesitamos el email del usuario para agregarlo al chat
      const user = await prisma.users.findUnique({ 
        where: { user_id: data.userId } 
      });

      if (user && user.email) {
        // Crear la sala con el ID de la reserva
        const chatRoomName = data.matchName || `Partido ${start.toLocaleDateString()}`;
        await ChatRoom.create({
          roomId: result.booking_id,
          name: chatRoomName,
          members: [user.email],
          createdAt: new Date()
        });
        console.log(`✅ Sala de chat creada para reserva: ${result.booking_id} - ${chatRoomName}`);
      }
    } catch (error) {
      console.error("⚠️ Error creando sala de chat (No afecta la reserva):", error);
    }

    // 4. Obtener datos completos para notificaciones
    try {
      const bookingWithDetails = await prisma.bookings.findUnique({
        where: { booking_id: result.booking_id },
        include: {
          users: true,  // Player info
          fields: {
            include: {
              users: true  // Owner info
            }
          }
        }
      });

      if (bookingWithDetails) {
        const player = bookingWithDetails.users;
        const field = bookingWithDetails.fields;
        const owner = field.users;

        // 5. Enviar emails de notificación (async, no bloqueante)
        EmailService.sendBookingNotifications({
          playerEmail: player.email,
          playerName: `${player.first_name} ${player.last_name}`,
          ownerEmail: owner.email,
          ownerName: `${owner.first_name} ${owner.last_name}`,
          fieldName: field.name,
          fieldAddress: field.address,
          startTime: bookingWithDetails.start_time,
          endTime: bookingWithDetails.end_time,
          totalPrice: Number(bookingWithDetails.total_price),
          bookingId: bookingWithDetails.booking_id
        }).catch(err => console.error("⚠️ Error enviando emails:", err));

        // 6. Emitir evento Socket.io para actualización en tiempo real del manager
        emitNewBooking(owner.user_id, {
          booking_id: bookingWithDetails.booking_id,
          player: {
            name: `${player.first_name} ${player.last_name}`,
            email: player.email
          },
          field: {
            field_id: field.field_id,
            name: field.name
          },
          start_time: bookingWithDetails.start_time,
          end_time: bookingWithDetails.end_time,
          total_price: Number(bookingWithDetails.total_price),
          status: bookingWithDetails.status
        });
      }
    } catch (error) {
      console.error("⚠️ Error en notificaciones (No afecta la reserva):", error);
    }

    return result;
  }

  /**
   * Cancel a booking and notify all parties
   */
  static async cancelBooking(bookingId: string, cancelledByUserId: string) {
    // 1. Obtener la reserva con todos los detalles necesarios
    const booking = await prisma.bookings.findUnique({
      where: { booking_id: bookingId },
      include: {
        users: true,  // Player
        fields: {
          include: {
            users: true  // Owner
          }
        }
      }
    });

    if (!booking) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    if (booking.status === 'cancelled') {
      throw new Error('BOOKING_ALREADY_CANCELLED');
    }

    const player = booking.users;
    const field = booking.fields;
    const owner = field.users;

    // Verificar si el que cancela es el player o el owner
    const isPlayerCancelling = cancelledByUserId === player.user_id;
    const isOwnerCancelling = cancelledByUserId === owner.user_id;

    if (!isPlayerCancelling && !isOwnerCancelling) {
      throw new Error('UNAUTHORIZED_CANCELLATION');
    }

    const cancelledByRole: 'player' | 'owner' = isPlayerCancelling ? 'player' : 'owner';
    const cancelledByName = isPlayerCancelling 
      ? `${player.first_name} ${player.last_name}` 
      : `${owner.first_name} ${owner.last_name}`;

    // 2. Actualizar el estado de la reserva
    const updatedBooking = await prisma.bookings.update({
      where: { booking_id: bookingId },
      data: { 
        status: 'cancelled',
        updated_at: new Date()
      }
    });

    // 3. Notificar a la contraparte por email
    try {
      // Si cancela el player, notificar al owner y viceversa
      const recipientEmail = isPlayerCancelling ? owner.email : player.email;
      const recipientName = isPlayerCancelling 
        ? `${owner.first_name} ${owner.last_name}` 
        : `${player.first_name} ${player.last_name}`;

      await EmailService.sendCancellationNotification({
        recipientEmail,
        recipientName,
        cancelledByRole,
        cancelledByName,
        fieldName: field.name,
        startTime: booking.start_time,
        endTime: booking.end_time,
        bookingId: booking.booking_id
      });
    } catch (error) {
      console.error("⚠️ Error enviando email de cancelación:", error);
    }

    // 4. Emitir evento Socket.io para actualización en tiempo real
    emitBookingCancelled(
      owner.user_id,
      player.user_id,
      {
        booking_id: booking.booking_id,
        field: {
          field_id: field.field_id,
          name: field.name
        },
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: 'cancelled'
      },
      cancelledByRole
    );

    return updatedBooking;
  }

  /**
   * Get a booking by ID with full details
   */
  static async getBookingById(bookingId: string) {
    return prisma.bookings.findUnique({
      where: { booking_id: bookingId },
      include: {
        users: {
          select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone_number: true
          }
        },
        fields: {
          select: {
            field_id: true,
            name: true,
            address: true,
            owner_id: true
          }
        },
        payments: true
      }
    });
  }
}