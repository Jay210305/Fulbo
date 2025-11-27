import { Server, Socket } from "socket.io";
import Message from "../models/Message"; // Imported from the first snippet

export const chatSocketHandler = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`⚡ Cliente conectado al socket: ${socket.id}`);

    // Event: Join a room (e.g., specific match room #123)
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`Usuario ${socket.id} se unió a la sala: ${roomId}`);
    });

    // Event: Send Message (Async to handle Database)
    socket.on("send_message", async (data) => {
      // Log for debugging (from snippet B)
      console.log(`Mensaje en sala ${data.roomId}: ${data.message}`);

      try {
        // 1. Save to MongoDB (from snippet A)
        const newMessage = new Message({
          roomId: data.roomId,
          senderId: data.senderId, // Ensure frontend sends this!
          content: data.message,
          timestamp: new Date()
        });
        
        const savedMessage = await newMessage.save();

        // 2. Emit to the room using the saved data 
        // We include _id and true timestamp from Mongo to ensure frontend sync
        io.to(data.roomId).emit("receive_message", {
          ...data,
          _id: savedMessage._id,
          timestamp: savedMessage.timestamp
        });
        
      } catch (error) {
        console.error("Error guardando mensaje:", error);
        // Optional: Emit an error back to the sender if save fails
        // socket.emit("error_message", { message: "Failed to send" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Cliente desconectado del socket");
    });
  });
};