// backend/src/models/Message.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  senderId: string; // ID del usuario que envía
  roomId: string;   // ID del partido o sala de chat
  content: string;  // El texto del mensaje
  timestamp: Date;  // Hora de envío
}

const MessageSchema: Schema = new Schema({
  senderId: { type: String, required: true },
  roomId:   { type: String, required: true, index: true }, // Indexado para buscar rápido los chats de un partido
  content:  { type: String, required: true },
  timestamp:{ type: Date, default: Date.now },
});

export default mongoose.model<IMessage>("Message", MessageSchema);