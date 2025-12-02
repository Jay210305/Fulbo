import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import mongoose from 'mongoose';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  services: {
    api: ServiceStatus;
    postgres: ServiceStatus;
    mongodb: ServiceStatus;
  };
  version: string;
}

interface ServiceStatus {
  status: 'up' | 'down';
  responseTime?: number;
  error?: string;
}

/**
 * Check PostgreSQL connection
 */
async function checkPostgres(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'up',
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error.message,
    };
  }
}

/**
 * Check MongoDB connection
 */
async function checkMongoDB(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const state = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (state === 1) {
      // Ping the database
      await mongoose.connection.db?.admin().ping();
      return {
        status: 'up',
        responseTime: Date.now() - start,
      };
    } else {
      return {
        status: 'down',
        responseTime: Date.now() - start,
        error: `Connection state: ${state}`,
      };
    }
  } catch (error: any) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error.message,
    };
  }
}

/**
 * GET /api/health
 * Basic health check - returns 200 if API is running
 */
router.get('/', async (req: Request, res: Response) => {
  const [postgresStatus, mongoStatus] = await Promise.all([
    checkPostgres(),
    checkMongoDB(),
  ]);

  const allServicesUp = postgresStatus.status === 'up' && mongoStatus.status === 'up';
  const someServicesUp = postgresStatus.status === 'up' || mongoStatus.status === 'up';

  const overallStatus: HealthStatus['status'] = allServicesUp 
    ? 'healthy' 
    : someServicesUp 
      ? 'degraded' 
      : 'unhealthy';

  const health: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      api: { status: 'up' },
      postgres: postgresStatus,
      mongodb: mongoStatus,
    },
  };

  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;
  res.status(statusCode).json(health);
});

/**
 * GET /api/health/live
 * Kubernetes liveness probe - just checks if the process is running
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ status: 'alive' });
});

/**
 * GET /api/health/ready
 * Kubernetes readiness probe - checks if the service can accept traffic
 */
router.get('/ready', async (req: Request, res: Response) => {
  const postgresStatus = await checkPostgres();
  
  if (postgresStatus.status === 'up') {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready', reason: 'Database unavailable' });
  }
});

export default router;
