import { prisma } from '../config/prisma';

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
    return await prisma.fields.findUnique({
      where: { field_id: id },
      include: {
        field_photos: true,
        // En el futuro incluiremos reviews aquí
      }
    });
  }
}