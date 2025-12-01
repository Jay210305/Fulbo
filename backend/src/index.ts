import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketServer } from 'socket.io';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import chatRoutes from './routes/chat.routes';
import fieldRoutes from './routes/field.routes';
import bookingRoutes from './routes/booking.routes';
import managerRoutes from './routes/manager.routes';
import reviewRoutes from './routes/review.routes';
import uploadRoutes from './routes/upload.routes';
import healthRoutes from './routes/health.routes';

// Middleware
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { apiLimiter } from './middlewares/rateLimit.middleware';

// Config & Services
import { connectMongoDB } from './config/mongo';
import { chatSocketHandler } from './sockets/chat.socket';
import { bookingSocketHandler } from './sockets/booking.socket';
import { initScheduledJobs } from './jobs/cleanup.job';
import logger from './utils/logger';
import { setupSwagger } from './config/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURACIÓN DE SOCKETS Y SERVIDOR HTTP ---

// 1. Creamos un servidor HTTP "crudo" usando Express como base
const httpServer = http.createServer(app);

// 2. Inicializamos Socket.io pegado a ese servidor
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"]
  }
});

// 3. Conectamos la infraestructura del Chat y Booking
connectMongoDB();
chatSocketHandler(io);
bookingSocketHandler(io);

// --- MIDDLEWARES DE EXPRESS ---
// Security & Performance
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Swagger UI
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - applied to all API routes
app.use('/api', apiLimiter);

// Swagger API Documentation
setupSwagger(app);

// --- RUTAS ---
// Health check (no auth required, no rate limit)
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '⚽ Fulbo API is running!',
    environment: process.env.NODE_ENV,
    timestamp: new Date()
  });
});

// Handle 404 - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// --- INICIO DEL SERVIDOR ---
httpServer.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`📡 Esperando conexiones API...`);
  logger.info(`💬 Sistema de Chat (Sockets) listo y escuchando...`);
  
  // Initialize scheduled jobs (cron tasks)
  initScheduledJobs();
});