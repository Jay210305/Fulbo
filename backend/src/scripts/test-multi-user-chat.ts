// backend/src/scripts/test-multi-user-chat.ts
import { io as Client, Socket } from 'socket.io-client';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectMongoDB } from '../config/mongo';
import Message from '../models/Message';

dotenv.config();

const PORT = process.env.PORT || 4000;
const SOCKET_URL = `http://localhost:${PORT}`;

function createClient(name: string): Socket {
    const socket = Client(SOCKET_URL, {
        forceNew: true, // Important for multiple clients
    });
    socket.on('connect', () => {
        console.log(`   ✅ ${name} conectado. ID: ${socket.id}`);
    });
    return socket;
}

async function main() {
  console.log('💬 INICIANDO TEST DE CHAT MULTI-USUARIO (DEV C)\n');

  try {
    // 1. Conectar DB (para limpieza posterior)
    await connectMongoDB();

    const roomId = 'multi-user-room-test';
    const userA = 'user-A@test.com';
    const userB = 'user-B@test.com';

    // 2. Conectar Clientes
    console.log('2️⃣  Conectando usuarios...');
    const clientA = createClient('User A');
    const clientB = createClient('User B');

    // Esperar conexión
    await new Promise<void>((resolve) => {
        let connected = 0;
        const check = () => {
            connected++;
            if (connected === 2) resolve();
        };
        clientA.on('connect', check);
        clientB.on('connect', check);
    });

    // 3. Unirse a la sala
    console.log(`\n3️⃣  Uniéndose a la sala: ${roomId}`);
    clientA.emit('join_room', roomId);
    clientB.emit('join_room', roomId);

    // Esperar un poco para que el join se procese
    await new Promise((r) => setTimeout(r, 500));

    // 4. User A envía mensaje -> User B recibe
    console.log('\n4️⃣  Prueba: A envía -> B recibe');
    const msgFromA = 'Hola B, soy A';
    
    const promiseReceiveB = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout esperando mensaje en B')), 3000);
        clientB.on('receive_message', (data) => {
            if (data.message === msgFromA && data.senderId === userA) {
                clearTimeout(timeout);
                console.log('   ✅ B recibió mensaje de A:', data.message);
                resolve();
            }
        });
    });

    clientA.emit('send_message', { roomId, message: msgFromA, senderId: userA });
    await promiseReceiveB;

    // 5. User B envía mensaje -> User A recibe
    console.log('\n5️⃣  Prueba: B envía -> A recibe');
    const msgFromB = 'Hola A, te copio fuerte y claro';

    const promiseReceiveA = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout esperando mensaje en A')), 3000);
        clientA.on('receive_message', (data) => {
            if (data.message === msgFromB && data.senderId === userB) {
                clearTimeout(timeout);
                console.log('   ✅ A recibió mensaje de B:', data.message);
                resolve();
            }
        });
    });

    clientB.emit('send_message', { roomId, message: msgFromB, senderId: userB });
    await promiseReceiveA;

    console.log('\n✅ PRUEBA MULTI-USUARIO EXITOSA');

    // Limpieza
    clientA.disconnect();
    clientB.disconnect();

    // Borrar mensajes de prueba
    await Message.deleteMany({ roomId });
    console.log('   🧹 Mensajes de prueba eliminados.');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✨ Prueba finalizada.');
  }
}

main();
