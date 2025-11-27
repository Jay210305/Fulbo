import mongoose, { Schema, Document } from 'mongoose';

export interface IChatRoom extends Document {
  roomId: string;       // ID de la sala (puede ser el ID de la reserva)
  name?: string;        // Nombre (ej. "Pichanga Jueves")
  members: string[];    // Lista de emails de los participantes
  createdAt: Date;
}

const ChatRoomSchema: Schema = new Schema({
  roomId: { type: String, required: true, unique: true },
  name: { type: String },
  members: [{ type: String }], // Guardaremos los emails para simplificar
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IChatRoom>('ChatRoom', ChatRoomSchema);