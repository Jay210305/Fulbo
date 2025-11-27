// backend/src/sockets/chat.socket.ts
import { Server, Socket } from "socket.io";

export const chatSocketHandler = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`⚡ Cliente conectado al socket: ${socket.id}`);

    // Evento: Unirse a una sala (ej: sala del partido #123)
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`Usuario ${socket.id} se unió a la sala: ${roomId}`);
    });

    // Evento: Enviar mensaje
    socket.on("send_message", (data) => {
      // data debería tener: { roomId, message, senderId }
      console.log(`Mensaje en sala ${data.roomId}: ${data.message}`);
      
      // Reenviar el mensaje a todos en esa sala (incluyendo al que lo envió)
      io.to(data.roomId).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log("Cliente desconectado del socket");
    });
  });
};