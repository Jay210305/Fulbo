import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes'; // <--- 1. Importar rutas

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// --- RUTAS ---
// Todas las rutas de auth empezarán con /api/auth
app.use('/api/auth', authRoutes); // <--- 2. Usar rutas

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '⚽ Fulbo API is running!',
    environment: process.env.NODE_ENV,
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Esperando conexiones...`);
});