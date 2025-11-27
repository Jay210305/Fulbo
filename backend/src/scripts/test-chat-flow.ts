// backend/src/scripts/test-chat-flow.ts
import { io as Client } from 'socket.io-client';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectMongoDB } from '../config/mongo';
import Message from '../models/Message';

dotenv.config();

const PORT = process.env.PORT || 4000;
const SOCKET_URL = `http://localhost:${PORT}`;

async function main() {
  console.log('💬 INICIANDO TEST DE INFRAESTRUCTURA DE CHAT (DEV C)\n');

  try {
    // ---------------------------------------------------------
    // PASO 1: PRUEBA DE MONGODB (Persistencia)
    // ---------------------------------------------------------
    console.log('1️⃣  Probando Conexión y Modelo MongoDB...');
    await connectMongoDB();

    // Crear un mensaje de prueba
    const testMsg = new Message({
      senderId: 'user-test-123',
      roomId: 'room-test-abc',
      content: 'Hola desde el script de prueba de Dev C 🚀'
    });

    const savedMsg = await testMsg.save();
    console.log('   ✅ Mensaje guardado en MongoDB:', savedMsg._id);

    // Verificar que se puede leer
    const foundMsg = await Message.findById(savedMsg._id);
    if (foundMsg?.content === testMsg.content) {
      console.log('   ✅ Mensaje recuperado correctamente.');
    } else {
      throw new Error('El mensaje recuperado no coincide.');
    }

    // Limpieza (Borrar el mensaje de prueba)
    await Message.deleteOne({ _id: savedMsg._id });
    console.log('   🧹 Mensaje de prueba eliminado (Limpieza).');


    // ---------------------------------------------------------
    // PASO 2: PRUEBA DE SOCKETS (Tiempo Real)
    // ---------------------------------------------------------
    console.log('\n2️⃣  Probando Servidor Socket.io...');
    
    return new Promise<void>((resolve, reject) => {
      // Conectar cliente simulado
      const socket = Client(SOCKET_URL);

      const roomId = 'partido-final-123';
      const messagePayload = {
        roomId,
        message: '¡Gol del equipo visitante!',
        senderId: 'jugador-9'
      };

      socket.on('connect', () => {
        console.log('   ✅ Cliente conectado al Socket Server. ID:', socket.id);
        
        // A. Unirse a la sala
        console.log(`   📤 Enviando evento: join_room (${roomId})`);
        socket.emit('join_room', roomId);

        // B. Enviar mensaje
        // Esperamos un poco para asegurar que nos unimos a la sala
        setTimeout(() => {
          console.log(`   📤 Enviando evento: send_message ("${messagePayload.message}")`);
          socket.emit('send_message', messagePayload);
        }, 500);
      });

      // C. Escuchar respuesta (El servidor debe retransmitir el mensaje)
      socket.on('receive_message', (data: any) => {
        console.log('   📥 Evento receive_message recibido:', data);
        
        if (data.message === messagePayload.message && data.roomId === roomId) {
          console.log('   ✅ EL CIRCUITO DE CHAT FUNCIONA: El servidor recibió y retransmitió el mensaje.');
          socket.disconnect();
          resolve();
        } else {
          reject(new Error('Los datos recibidos por el socket no coinciden.'));
        }
      });

      // Timeout de seguridad por si el servidor no responde
      setTimeout(() => {
        if (socket.connected) {
          console.error('   ❌ Timeout: El servidor no respondió el evento "receive_message".');
          socket.disconnect();
          reject(new Error('Timeout en prueba de sockets'));
        }
      }, 3000);
    });

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión a Mongo para terminar el proceso limpio
    await mongoose.connection.close();
    console.log('\n✨ Prueba finalizada.');
  }
}

main();