import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fulbo API',
      version: '1.0.0',
      description: `
# Fulbo API Documentation

API for the Fulbo mobile application - a platform for booking football/soccer fields.

## Features
- **Authentication**: JWT-based auth with refresh tokens
- **Fields**: Browse and search available football fields
- **Bookings**: Create, manage, and cancel reservations
- **Manager Portal**: Field management, promotions, products, and analytics
- **Reviews**: Rating and review system for fields
- **Real-time**: Socket.io for chat and booking notifications

## Authentication
Most endpoints require a Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <your-access-token>
\`\`\`

Access tokens expire in 15 minutes. Use the refresh token endpoint to get a new access token.
      `,
      contact: {
        name: 'Fulbo Team',
        email: 'support@fulbo.app',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.fulbo.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        // Common response schemas
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Error description' },
                code: { type: 'string', example: 'ERROR_CODE' },
                statusCode: { type: 'integer', example: 400 },
                details: { type: 'object' },
              },
            },
          },
        },
        // User schemas
        User: {
          type: 'object',
          properties: {
            user_id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            phone_number: { type: 'string' },
            role: { type: 'string', enum: ['player', 'manager'] },
            city: { type: 'string' },
            district: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        // Auth schemas
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
                expiresIn: { type: 'integer', example: 900 },
              },
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', minLength: 8, example: 'Password123' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phoneNumber: { type: 'string' },
            documentType: { type: 'string', enum: ['dni', 'ce', 'passport'] },
            documentNumber: { type: 'string' },
            city: { type: 'string' },
            district: { type: 'string' },
          },
        },
        // Field schemas
        Field: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            address: { type: 'string' },
            description: { type: 'string' },
            amenities: { type: 'object' },
            basePricePerHour: { type: 'number' },
            photos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  url: { type: 'string' },
                  isCover: { type: 'boolean' },
                },
              },
            },
            rating: { type: 'number' },
            reviewsCount: { type: 'integer' },
          },
        },
        // Booking schemas
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fieldId: { type: 'string', format: 'uuid' },
            playerId: { type: 'string', format: 'uuid' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            totalPrice: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'] },
            guestName: { type: 'string' },
            guestPhone: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateBookingRequest: {
          type: 'object',
          required: ['fieldId', 'startTime', 'endTime'],
          properties: {
            fieldId: { type: 'string', format: 'uuid' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            paymentMethod: { type: 'string' },
            guestName: { type: 'string' },
            guestPhone: { type: 'string' },
          },
        },
        // Promotion schemas
        Promotion: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            discountType: { type: 'string', enum: ['percentage', 'fixed_amount'] },
            discountValue: { type: 'number' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean' },
          },
        },
        // Product schemas
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            imageUrl: { type: 'string' },
            category: { type: 'string', enum: ['bebida', 'snack', 'equipo', 'promocion'] },
            isActive: { type: 'boolean' },
          },
        },
        // Review schemas
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fieldId: { type: 'string', format: 'uuid' },
            playerId: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // Health check
        HealthStatus: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number' },
            version: { type: 'string' },
            services: {
              type: 'object',
              properties: {
                api: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['up', 'down'] },
                  },
                },
                postgres: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['up', 'down'] },
                    responseTime: { type: 'number' },
                  },
                },
                mongodb: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['up', 'down'] },
                    responseTime: { type: 'number' },
                  },
                },
              },
            },
          },
        },
        // Stats
        DashboardStats: {
          type: 'object',
          properties: {
            totalRevenue: { type: 'number' },
            totalBookings: { type: 'integer' },
            confirmedBookings: { type: 'integer' },
            pendingBookings: { type: 'integer' },
            cancelledBookings: { type: 'integer' },
            uniqueCustomers: { type: 'integer' },
            averageBookingValue: { type: 'number' },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Fields', description: 'Field browsing endpoints (public)' },
      { name: 'Bookings', description: 'Booking management endpoints' },
      { name: 'Reviews', description: 'Review and rating endpoints' },
      { name: 'Manager - Fields', description: 'Manager field management' },
      { name: 'Manager - Promotions', description: 'Manager promotion management' },
      { name: 'Manager - Products', description: 'Manager product management' },
      { name: 'Manager - Stats', description: 'Manager dashboard statistics' },
      { name: 'Manager - Staff', description: 'Manager staff management' },
      { name: 'Manager - Schedule', description: 'Manager schedule block management' },
      { name: 'Upload', description: 'File upload endpoints' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/docs/*.yaml'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Swagger UI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Fulbo API Documentation',
  }));

  // JSON spec endpoint
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

export default swaggerSpec;
