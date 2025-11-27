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
        password_hash: 'hash', // En un caso real usa bcrypt
      }
    });
    console.log('👤 Usuario Manager creado para la prueba.');
  }

  // 2. Insertar Cancha usando SQL RAW
  // CORRECCIÓN: Agregamos 'field_id' y usamos 'gen_random_uuid()' para generar el ID en la BD.
  const lat = -16.3988;
  const lng = -71.5369;

  await prisma.$executeRaw`
    INSERT INTO fields (field_id, name, owner_id, address, base_price_per_hour, location, description)
    VALUES (
      gen_random_uuid(), 
      'Cancha La Monumental Arequipa',
      ${owner.user_id}::uuid,
      'Centro Histórico',
      45.00,
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
      'Cancha céntrica con ubicación PostGIS'
    );
  `;

  console.log('✅ Cancha con geolocalización insertada exitosamente.');
}

main()
  .catch(e => {
    console.error('❌ Error al sembrar datos:', e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());