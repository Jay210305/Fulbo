import { prisma } from '../config/prisma';
import { ReviewService } from './review.service';

export class FieldService {
  static async getNearbyFields(lat: number, lng: number, radiusKm: number = 5) {
    // Consulta RAW usando ST_DWithin de PostGIS para filtrar por radio
    // y ST_Distance para calcular la distancia en metros
    const fields = await prisma.$queryRaw`
      SELECT 
        field_id,
        name,
        address,
        base_price_per_hour,
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude,
        ST_Distance(location, ST_MakePoint(${lng}, ${lat})::geography) as distance_meters
      FROM fields
      WHERE ST_DWithin(location, ST_MakePoint(${lng}, ${lat})::geography, ${radiusKm * 1000})
      ORDER BY distance_meters ASC
      LIMIT 20;
    `;
    
    // Nota: queryRaw devuelve objetos planos, no incluye relaciones (fotos) automáticamente.
    // Para este MVP, haremos un segundo paso rápido para traer las fotos de estos IDs.
    // (En producción optimizaríamos con un JOIN manual).
    
    const fieldsWithPhotos = await Promise.all((fields as any[]).map(async (f) => {
      const photos = await prisma.field_photos.findMany({
        where: { field_id: f.field_id },
        select: { image_url: true },
        take: 1
      });
      
      return {
        ...f,
        image: photos[0]?.image_url || 'https://via.placeholder.com/400'
      };
    }));

    return fieldsWithPhotos;
  }

  static async getAllFields() {
    // Usamos findMany. Nota: Omitimos 'location' temporalmente porque Prisma
    // no puede serializar el objeto binario de PostGIS directamente a JSON sin conversión.
    // En la Fase 3 usaremos $queryRaw para la geolocalización.
    return await prisma.fields.findMany({
      select: {
        field_id: true,
        name: true,
        address: true,
        base_price_per_hour: true,
        description: true,
        amenities: true,
        field_photos: {
          select: {
            image_url: true
          },
          take: 1 // Solo traemos la primera foto para el Home
        }
      }
    });
  }

  static async getFieldById(id: string) {
    const field = await prisma.fields.findUnique({
      where: { field_id: id },
      include: {
        field_photos: true,
        reviews: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
          take: 5, // Latest 5 reviews
        },
      },
    });

    if (!field) return null;

    // Get rating statistics
    const ratingStats = await ReviewService.getFieldRatingStats(id);

    return {
      ...field,
      rating: ratingStats.averageRating,
      reviewCount: ratingStats.reviewCount,
      popularTags: ratingStats.popularTags,
    };
  }

  /**
   * Get field availability for a date range, excluding booked slots and schedule blocks
   */
  static async getFieldAvailability(fieldId: string, startDate: Date, endDate: Date) {
    // Get existing bookings (non-cancelled)
    const bookings = await prisma.bookings.findMany({
      where: {
        field_id: fieldId,
        status: { not: 'cancelled' },
        start_time: { lt: endDate },
        end_time: { gt: startDate },
      },
      select: {
        booking_id: true,
        start_time: true,
        end_time: true,
      },
      orderBy: { start_time: 'asc' },
    });

    // Get schedule blocks
    const blocks = await prisma.schedule_blocks.findMany({
      where: {
        field_id: fieldId,
        start_time: { lt: endDate },
        end_time: { gt: startDate },
      },
      select: {
        block_id: true,
        start_time: true,
        end_time: true,
        reason: true,
      },
      orderBy: { start_time: 'asc' },
    });

    return {
      bookings: bookings.map(b => ({
        id: b.booking_id,
        startTime: b.start_time,
        endTime: b.end_time,
        type: 'booking' as const,
      })),
      blocks: blocks.map(b => ({
        id: b.block_id,
        startTime: b.start_time,
        endTime: b.end_time,
        reason: b.reason,
        type: 'block' as const,
      })),
    };
  }

  /**
   * Check if a time slot is available (not booked and not blocked)
   */
  static async isSlotAvailable(fieldId: string, startTime: Date, endTime: Date): Promise<boolean> {
    // Check for overlapping bookings
    const bookingOverlap = await prisma.bookings.findFirst({
      where: {
        field_id: fieldId,
        status: { not: 'cancelled' },
        OR: [
          { start_time: { lt: endTime }, end_time: { gt: startTime } },
        ],
      },
    });

    if (bookingOverlap) return false;

    // Check for overlapping schedule blocks
    const blockOverlap = await prisma.schedule_blocks.findFirst({
      where: {
        field_id: fieldId,
        start_time: { lt: endTime },
        end_time: { gt: startTime },
      },
    });

    return !blockOverlap;
  }
}