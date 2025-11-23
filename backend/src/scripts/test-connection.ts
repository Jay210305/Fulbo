import { prisma } from '../config/prisma';

async function main() {
  console.log('🔌 Iniciando prueba de conexión a PostgreSQL + PostGIS...');

  try {
    // 1. Probar conexión básica y versión de PostGIS
    // Esto confirma que la extensión geoespacial está activa en Docker
    const postgisVersion = await prisma.$queryRaw`SELECT PostGIS_Full_Version()`;
    console.log('✅ Conexión Exitosa. PostGIS Version:', postgisVersion);

    // 2. Limpiar datos de prueba anteriores (para evitar errores de unique constraint)
    const emailTest = 'manager_test@fulbo.com';
    await prisma.bookings.deleteMany({});
    await prisma.reviews.deleteMany({});
    await prisma.field_photos.deleteMany({});
    await prisma.fields.deleteMany({ where: { users: { email: emailTest } } });
    await prisma.users.deleteMany({ where: { email: emailTest } });
    console.log('🧹 Datos de prueba anteriores limpiados.');

    // 3. Crear un Usuario Manager (Simulado)
    const manager = await prisma.users.create({
      data: {
        email: emailTest,
        first_name: 'Manager',
        last_name: 'Test',
        role: 'manager',
        password_hash: 'dummy_hash', // No importa para este test
        phone_number: '+51999999999'
      },
    });
    console.log(`👤 Usuario Manager creado: ${manager.user_id}`);

    // 4. Crear una Cancha (Prueba de escritura relacional)
    // Nota: Location se deja null por ahora, usaremos Raw Query para insertar geografía más adelante
    const field = await prisma.fields.create({
      data: {
        name: 'Cancha Test 1',
        owner_id: manager.user_id,
        address: 'Av. Prueba 123',
        description: 'Cancha de prueba generada por script',
        base_price_per_hour: 50.00,
        amenities: { wifi: true, parking: true } // Probando campo JSONB
      },
    });
    console.log(`jh Cancha creada exitosamente: ${field.name} (ID: ${field.field_id})`);

    console.log('\n🎉 ¡TODO FUNCIONA! Tu entorno Backend está listo para desarrollar.');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();