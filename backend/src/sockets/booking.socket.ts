import { Server } from "socket.io";

// Store the Socket.io instance for use in other services
let ioInstance: Server | null = null;

/**
 * Initialize the booking socket handler
 * Sets up real-time booking events for manager dashboard
 */
export const bookingSocketHandler = (io: Server) => {
  ioInstance = io;
  
  io.on("connection", (socket) => {
    console.log(`⚡ Cliente conectado para bookings: ${socket.id}`);

    // Manager joins their dashboard room to receive booking updates
    // Room format: "manager_dashboard_{owner_id}"
    socket.on("join_manager_dashboard", (ownerId: string) => {
      const roomName = `manager_dashboard_${ownerId}`;
      socket.join(roomName);
      console.log(`📊 Manager ${socket.id} se unió al dashboard: ${roomName}`);
    });

    // Player can join to receive updates about their bookings
    socket.on("join_player_bookings", (playerId: string) => {
      const roomName = `player_bookings_${playerId}`;
      socket.join(roomName);
      console.log(`👤 Player ${socket.id} se unió a sus reservas: ${roomName}`);
    });

    // Leave rooms on disconnect
    socket.on("disconnect", () => {
      console.log(`🔌 Cliente desconectado de bookings: ${socket.id}`);
    });
  });
};

/**
 * Emit new booking event to the manager dashboard
 * Called from BookingService after a successful booking
 */
export const emitNewBooking = (ownerId: string, bookingData: any) => {
  if (!ioInstance) {
    console.warn("⚠️ Socket.io not initialized for booking events");
    return;
  }

  const roomName = `manager_dashboard_${ownerId}`;
  ioInstance.to(roomName).emit("new_booking", {
    type: "new_booking",
    booking: bookingData,
    timestamp: new Date().toISOString()
  });
  
  console.log(`📡 Evento new_booking emitido al manager: ${ownerId}`);
};

/**
 * Emit booking cancellation event
 * Notifies both the manager and the player about the cancellation
 */
export const emitBookingCancelled = (
  ownerId: string, 
  playerId: string, 
  bookingData: any, 
  cancelledBy: 'player' | 'owner'
) => {
  if (!ioInstance) {
    console.warn("⚠️ Socket.io not initialized for booking events");
    return;
  }

  const eventPayload = {
    type: "booking_cancelled",
    booking: bookingData,
    cancelledBy,
    timestamp: new Date().toISOString()
  };

  // Notify the manager
  const managerRoom = `manager_dashboard_${ownerId}`;
  ioInstance.to(managerRoom).emit("booking_cancelled", eventPayload);

  // Notify the player
  const playerRoom = `player_bookings_${playerId}`;
  ioInstance.to(playerRoom).emit("booking_cancelled", eventPayload);

  console.log(`📡 Evento booking_cancelled emitido (cancelado por ${cancelledBy})`);
};

/**
 * Emit booking update event (for status changes, time changes, etc.)
 */
export const emitBookingUpdated = (
  ownerId: string, 
  playerId: string, 
  bookingData: any
) => {
  if (!ioInstance) {
    console.warn("⚠️ Socket.io not initialized for booking events");
    return;
  }

  const eventPayload = {
    type: "booking_updated",
    booking: bookingData,
    timestamp: new Date().toISOString()
  };

  // Notify both parties
  const managerRoom = `manager_dashboard_${ownerId}`;
  const playerRoom = `player_bookings_${playerId}`;
  
  ioInstance.to(managerRoom).emit("booking_updated", eventPayload);
  ioInstance.to(playerRoom).emit("booking_updated", eventPayload);

  console.log(`📡 Evento booking_updated emitido`);
};

/**
 * Get the current Socket.io instance
 */
export const getSocketInstance = (): Server | null => {
  return ioInstance;
};
