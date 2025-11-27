// backend/src/scripts/seed-geo.ts
import { prisma } from '../config/prisma';

async function main() {
  console.log('🌱 Sembrando datos geográficos...');

  // 1. Obtener un usuario dueño (crea uno si no hay)
  let owner = await prisma.users.findFirst({ where: { role: 'manager' } });
  if (!owner) {
    owner = await prisma.users.create({
      data: {
        email: 'geo_owner@fulbo.com',
        first_name: 'Geo',
        last_name: 'Admin',
        role: 'manager',
        password_hash: 'hash',
      }
    });
  }

  // 2. Insertar Cancha usando SQL RAW para la función ST_MakePoint
  // Coordenadas ejemplo: Plaza de Armas de Arequipa (-16.3988, -71.5369)
  const lat = -16.3988;
  const lng = -71.5369;

  // Usamos executeRaw para INSERT
  await prisma.$executeRaw`
    INSERT INTO fields (name, owner_id, address, base_price_per_hour, location, description)
    VALUES (
      'Cancha La Monumental Arequipa',
      ${owner.user_id}::uuid,
      'Centro Histórico',
      45.00,
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
      'Cancha céntrica con ubicación PostGIS'
    );
  `;

  console.log('✅ Cancha con geolocalización insertada.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());