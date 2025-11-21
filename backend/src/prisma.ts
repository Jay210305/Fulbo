import { PrismaClient } from '../generated/prisma';

/**
 * Patrón Singleton para PrismaClient.
 * Esto evita que se creen múltiples instancias de conexión a la base de datos
 * durante el "hot-reloading" en desarrollo.
 */

// Extendemos el objeto global para guardar la instancia
declare const global: typeof globalThis & {
  prisma?: PrismaClient;
};

const globalForPrisma = global as { prisma?: PrismaClient };

// Si ya existe, la usamos. Si no, creamos una nueva.
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Logs útiles para ver SQL en consola
});

// En desarrollo, guardamos la instancia en global para reutilizarla
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;