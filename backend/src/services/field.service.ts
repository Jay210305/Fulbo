import { prisma } from '../config/prisma';

export class FieldService {
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