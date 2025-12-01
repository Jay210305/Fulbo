import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import chatRoutes from './routes/chat.routes';
// Estos imports ya los tenías bien, son necesarios para el chat:
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { connectMongoDB } from './config/mongo';
import { chatSocketHandler } from './sockets/chat.socket';
import { bookingSocketHandler } from './sockets/booking.socket';
import fieldRoutes from './routes/field.routes';
import bookingRoutes from './routes/booking.routes';
import managerRoutes from './routes/manager.routes';
import reviewRoutes from './routes/review.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURACIÓN DE SOCKETS Y SERVIDOR HTTP ---

// 1. Creamos un servidor HTTP "crudo" usando Express como base
// (Esto es obligatorio porque Socket.io necesita adherirse a un servidor HTTP real)
const httpServer = http.createServer(app);

// 2. Inicializamos Socket.io pegado a ese servidor
const io = new SocketServer(httpServer, {
  cors: {
    origin: "*", // En desarrollo permitimos todo. En prod se restringe al frontend.
    methods: ["GET", "POST"]
  }
});

// 3. Conectamos la infraestructura del Chat y Booking
connectMongoDB();           // Conecta a MongoDB
chatSocketHandler(io);      // Inicia la escucha de eventos del chat
bookingSocketHandler(io);   // Inicia la escucha de eventos de reservas

// --- MIDDLEWARES DE EXPRESS ---
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// --- RUTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '⚽ Fulbo API is running!',
    environment: process.env.NODE_ENV,
    timestamp: new Date()
  });
});

// --- INICIO DEL SERVIDOR ---
// 4. IMPORTANTE: Usamos httpServer.listen en vez de app.listen
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Esperando conexiones API...`);
  console.log(`💬 Sistema de Chat (Sockets) listo y escuchando...`);
});