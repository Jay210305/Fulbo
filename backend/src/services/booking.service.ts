import { prisma } from '../config/prisma';
import ChatRoom from '../models/ChatRoom';
import { EmailService } from './email.service';
import { emitNewBooking, emitBookingCancelled } from '../sockets/booking.socket';
import { ScheduleBlockService } from './schedule-block.service';

interface CreateBookingDto {
  userId?: string;
  fieldId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  totalPrice?: number; // Now optional - backend calculates
  paymentMethod?: string;
  matchName?: string;
  userRole: string;
  guestName?: string;
  guestPhone?: string;
}

export class BookingService {
  /**
   * Calculate the booking price based on field rate and applicable promotions
   * This is the source of truth for pricing - never trust frontend prices
   */
  private static async calculateBookingPrice(
    fieldId: string, 
    startTime: Date, 
    endTime: Date
  ): Promise<number> {
    // 1. Fetch field with base price
    const field = await prisma.fields.findUnique({
      where: { field_id: fieldId },
      select: { base_price_per_hour: true }
    });

    if (!field) {
      throw new Error('FIELD_NOT_FOUND');
    }

    const basePricePerHour = Number(field.base_price_per_hour);

    // 2. Calculate duration in hours
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    // 3. Calculate base total
    let totalPrice = basePricePerHour * durationHours;

    // 4. Fetch active promotions for this field that cover the booking date
    const bookingDate = startTime;
    const activePromotions = await prisma.promotions.findMany({
      where: {
        field_id: fieldId,
        is_active: true,
        deleted_at: null,
        start_date: { lte: bookingDate },
        end_date: { gte: bookingDate }
      },
      orderBy: { discount_value: 'desc' } // Sort by highest discount first
    });

    // 5. Apply the best promotion (highest percentage discount)
    if (activePromotions.length > 0) {
      // Find the best percentage discount
      const percentagePromotions = activePromotions.filter(
        p => p.discount_type === 'percentage'
      );
      
      if (percentagePromotions.length > 0) {
        // Apply highest percentage discount
        const bestPromo = percentagePromotions[0];
        const discountPercent = Number(bestPromo.discount_value);
        totalPrice = totalPrice * (1 - discountPercent / 100);
      } else {
        // Apply fixed amount discount if no percentage promotions
        const fixedPromotions = activePromotions.filter(
          p => p.discount_type === 'fixed_amount'
        );
        if (fixedPromotions.length > 0) {
          const bestFixedPromo = fixedPromotions[0];
          totalPrice = Math.max(0, totalPrice - Number(bestFixedPromo.discount_value));
        }
      }
    }

    // Round to 2 decimal places
    return Math.round(totalPrice * 100) / 100;
  }

  static async createBooking(data: CreateBookingDto) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const isManager = data.userRole === 'manager';

    // Step A: PRICE SECURITY - Always calculate price on backend
    // NEVER trust the totalPrice from frontend
    const calculatedPrice = await this.calculateBookingPrice(data.fieldId, start, end);

    // Step B: ROLE HANDLING
    if (isManager) {
      // Verify manager owns the field
      const field = await prisma.fields.findFirst({
        where: {
          field_id: data.fieldId,
          owner_id: data.userId
        }
      });

      if (!field) {
        throw new Error('UNAUTHORIZED_FIELD_ACCESS');
      }

      // For manual bookings, either player_id OR guest_name must be provided
      if (!data.userId && !data.guestName) {
        // Manager is booking without a player account, guest info is required
        // Note: data.userId here would be the manager's ID, not the player's
        // For walk-in bookings, guestName should be provided
      }
    } else {
      // Player role - must have userId
      if (!data.userId) {
        throw new Error('PLAYER_ID_REQUIRED');
      }
    }

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

    // 2. Transacción Atómica: Reserva + Pago
    const result = await prisma.$transaction(async (tx) => {
      // Determine booking status based on role
      // Managers bypass payment - immediately confirmed
      // Players start as pending (or confirmed if simulating payment success)
      const bookingStatus = isManager ? 'confirmed' : 'confirmed'; // Change to 'pending' for real payment flow

      // Determine player_id - null for guest bookings
      const playerId = isManager && data.guestName ? null : data.userId;

      // A. Crear la Reserva
      const newBooking = await tx.bookings.create({
        data: {
          player_id: playerId,
          field_id: data.fieldId,
          start_time: start,
          end_time: end,
          total_price: calculatedPrice, // SECURITY: Use calculated price, not frontend
          status: bookingStatus,
          guest_name: data.guestName || null,
          guest_phone: data.guestPhone || null,
        },
      });

      // B. Crear el Pago
      if (isManager) {
        // Manager bookings - create CASH payment record (no gateway)
        await tx.payments.create({
          data: {
            booking_id: newBooking.booking_id,
            amount: calculatedPrice,
            status: 'succeeded',
            payment_gateway_id: `CASH_${Date.now()}`,
          },
        });
      } else {
        // Player bookings - Simulated payment success
        await tx.payments.create({
          data: {
            booking_id: newBooking.booking_id,
            amount: calculatedPrice,
            status: 'succeeded', // ¡Aquí está la "magia" del desarrollo!
            payment_gateway_id: `SIMULADO_${Date.now()}_${data.paymentMethod || 'EFECTIVO'}`,
          },
        });
      }

      return newBooking;
    });

    // 3. Crear Sala de Chat en MongoDB (Sincronización) - Only for registered players
    if (data.userId) {
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
    }

    // 4. Obtener datos completos para notificaciones
    try {
      const bookingWithDetails = await prisma.bookings.findUnique({
        where: { booking_id: result.booking_id },
        include: {
          users: true,  // Player info (can be null for guest bookings)
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
        const isGuestBooking = !player && bookingWithDetails.guest_name;

        // 5. Enviar emails de notificación (async, no bloqueante)
        // For guest bookings, we can only notify the owner
        if (player) {
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
        }

        // 6. Emitir evento Socket.io para actualización en tiempo real del manager
        const playerInfo = player 
          ? { name: `${player.first_name} ${player.last_name}`, email: player.email }
          : { name: bookingWithDetails.guest_name || 'Invitado', email: null };

        emitNewBooking(owner.user_id, {
          booking_id: bookingWithDetails.booking_id,
          player: playerInfo,
          field: {
            field_id: field.field_id,
            name: field.name
          },
          start_time: bookingWithDetails.start_time,
          end_time: bookingWithDetails.end_time,
          total_price: Number(bookingWithDetails.total_price),
          status: bookingWithDetails.status,
          guest_name: bookingWithDetails.guest_name,
          guest_phone: bookingWithDetails.guest_phone
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
    const isPlayerCancelling = player && cancelledByUserId === player.user_id;
    const isOwnerCancelling = cancelledByUserId === owner.user_id;

    if (!isPlayerCancelling && !isOwnerCancelling) {
      throw new Error('UNAUTHORIZED_CANCELLATION');
    }

    const cancelledByRole: 'player' | 'owner' = isPlayerCancelling ? 'player' : 'owner';
    const cancelledByName = isPlayerCancelling && player
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
      if (player) {
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
      }
    } catch (error) {
      console.error("⚠️ Error enviando email de cancelación:", error);
    }

    // 4. Emitir evento Socket.io para actualización en tiempo real
    if (player) {
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
    }

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

  /**
   * Get all bookings for a specific user (player)
   */
  static async getBookingsByUser(userId: string) {
    return prisma.bookings.findMany({
      where: { player_id: userId },
      include: {
        fields: {
          select: {
            field_id: true,
            name: true,
            address: true,
            owner_id: true
          }
        }
      },
      orderBy: { start_time: 'desc' }
    });
  }

  /**
   * Get bookings for a specific field with optional date range filtering
   */
  static async getFieldBookings(fieldId: string, fromDate?: Date, toDate?: Date) {
    const whereClause: any = { field_id: fieldId };

    if (fromDate || toDate) {
      whereClause.start_time = {};
      if (fromDate) {
        whereClause.start_time.gte = fromDate;
      }
      if (toDate) {
        whereClause.start_time.lte = toDate;
      }
    }

    return prisma.bookings.findMany({
      where: whereClause,
      include: {
        users: {
          select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone_number: true
          }
        }
      },
      orderBy: { start_time: 'desc' }
    });
  }

  /**
   * Reschedule a booking to a new time slot
   */
  static async rescheduleBooking(
    bookingId: string,
    newStartTime: string,
    newEndTime: string,
    userId: string
  ) {
    const newStart = new Date(newStartTime);
    const newEnd = new Date(newEndTime);

    // 1. Fetch the booking with full details
    const booking = await prisma.bookings.findUnique({
      where: { booking_id: bookingId },
      include: {
        users: true, // Player
        fields: {
          include: {
            users: true, // Owner
          },
        },
      },
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

    // Validation 1: Permissions - user must be player or owner
    const isPlayer = player && userId === player.user_id;
    const isOwner = userId === owner.user_id;

    if (!isPlayer && !isOwner) {
      throw new Error('UNAUTHORIZED');
    }

    // Validation 2: Check for schedule blocks (Maintenance, Personal closures, Events)
    const isBlocked = await ScheduleBlockService.isTimeSlotBlocked(field.field_id, newStart, newEnd);
    if (isBlocked) {
      throw new Error('HORARIO_BLOQUEADO');
    }

    // Validation 3: Check for overlapping bookings (excluding this booking itself)
    const overlap = await prisma.bookings.findFirst({
      where: {
        field_id: field.field_id,
        booking_id: { not: bookingId }, // CRITICAL: Exclude the current booking
        status: { not: 'cancelled' },
        OR: [
          {
            // New booking starts within an existing one
            start_time: { lte: newStart },
            end_time: { gt: newStart },
          },
          {
            // New booking ends within an existing one
            start_time: { lt: newEnd },
            end_time: { gte: newEnd },
          },
          {
            // New booking completely contains an existing one
            start_time: { gte: newStart },
            end_time: { lte: newEnd },
          },
        ],
      },
    });

    if (overlap) {
      throw new Error('HORARIO_OCUPADO');
    }

    // Store old times for notification
    const oldStartTime = booking.start_time;
    const oldEndTime = booking.end_time;

    // Update the booking with new times
    const updatedBooking = await prisma.bookings.update({
      where: { booking_id: bookingId },
      data: {
        start_time: newStart,
        end_time: newEnd,
        updated_at: new Date(),
      },
      include: {
        users: true,
        fields: {
          include: {
            users: true,
          },
        },
      },
    });

    // Send reschedule notification (non-blocking)
    const rescheduledByRole: 'player' | 'owner' = isPlayer ? 'player' : 'owner';
    const rescheduledByName = isPlayer && player
      ? `${player.first_name} ${player.last_name}`
      : `${owner.first_name} ${owner.last_name}`;

    // Notify the other party
    if (player) {
      const recipientEmail = isPlayer ? owner.email : player.email;
      const recipientName = isPlayer
        ? `${owner.first_name} ${owner.last_name}`
        : `${player.first_name} ${player.last_name}`;

      EmailService.sendRescheduleNotification({
        recipientEmail,
        recipientName,
        rescheduledByRole,
        rescheduledByName,
        fieldName: field.name,
        oldStartTime,
        oldEndTime,
        newStartTime: newStart,
        newEndTime: newEnd,
        bookingId: booking.booking_id,
      }).catch((err) => console.error('⚠️ Error enviando email de reprogramación:', err));
    }

    console.log(`✅ Reserva ${bookingId} reprogramada por ${rescheduledByRole}: ${oldStartTime.toISOString()} -> ${newStart.toISOString()}`);

    return updatedBooking;
  }

  /**
   * Cancel expired pending bookings that have been waiting for payment for more than 15 minutes.
   * This is called by the scheduled cleanup job to free up blocked slots.
   */
  static async cancelExpiredBookings(): Promise<number> {
    // Calculate the cut-off time: 15 minutes ago
    const threshold = new Date(Date.now() - 15 * 60 * 1000);

    // Find and update all expired pending bookings
    const result = await prisma.bookings.updateMany({
      where: {
        status: 'pending',
        created_at: {
          lt: threshold
        }
      },
      data: {
        status: 'cancelled'
      }
    });

    const cancelledCount = result.count;

    if (cancelledCount > 0) {
      console.log(`🧹 Cleaned up ${cancelledCount} expired booking(s)`);
    }

    return cancelledCount;
  }
}