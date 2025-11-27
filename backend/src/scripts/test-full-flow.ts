// backend/src/scripts/test-full-flow.ts
import dotenv from 'dotenv';

// Cargar variables de entorno para asegurar consistencia (aunque usaremos fetch al localhost)
dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 3000}/api`;
const TEST_ID = Date.now(); // Para hacer único el email

// Datos del usuario de prueba
const testUser = {
  firstName: 'Test',
  lastName: 'Player',
  email: `player_${TEST_ID}@fulbo.com`,
  password: 'Password123!',
  phone: '+51900000000'
};

let authToken = '';
let userId = '';

async function main() {
  console.log('🚀 INICIANDO TEST DE FLUJO COMPLETO (E2E)\n');

  try {
    // ---------------------------------------------------------
    // PASO 1: REGISTRO
    // ---------------------------------------------------------
    console.log('1️⃣  Probando REGISTRO (/auth/register)...');
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        phoneNumber: testUser.phone
      })
    });

    const registerData = await registerRes.json();
    
    if (!registerRes.ok) throw new Error(`Error en registro: ${registerData.error || registerData.message}`);
    
    console.log('   ✅ Usuario registrado:', registerData.user.email);
    
    // ---------------------------------------------------------
    // PASO 2: LOGIN
    // ---------------------------------------------------------
    console.log('\n2️⃣  Probando LOGIN (/auth/login)...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok) throw new Error(`Error en login: ${loginData.message}`);
    
    authToken = loginData.token;
    userId = loginData.user.user_id;
    console.log('   ✅ Login exitoso.');
    console.log('   🔑 Token JWT recibido:', authToken.substring(0, 20) + '...');

    // ---------------------------------------------------------
    // PASO 3: PERFIL PROTEGIDO (Middleware Auth)
    // ---------------------------------------------------------
    console.log('\n3️⃣  Probando RUTA PROTEGIDA (/users/profile)...');
    const profileRes = await fetch(`${API_URL}/users/profile`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const profileData = await profileRes.json();

    if (!profileRes.ok) throw new Error(`Error al obtener perfil: ${profileData.message}`);
    
    console.log('   ✅ Perfil recuperado correctamente.');
    console.log(`   👤 Hola, ${profileData.first_name} ${profileData.last_name} (${profileData.role})`);

    // ---------------------------------------------------------
    // PASO 4: VERIFICACIÓN DE TELÉFONO
    // ---------------------------------------------------------
    console.log('\n4️⃣  Probando VERIFICACIÓN DE TELÉFONO (/users/verify-phone)...');
    const verifyRes = await fetch(`${API_URL}/users/verify-phone`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: '+51999888777',
        code: '123456' // Código mockeado definido en user.controller.ts
      })
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok) throw new Error(`Error verificando teléfono: ${verifyData.message}`);
    
    console.log('   ✅ Teléfono verificado:', verifyData.message);

    // ---------------------------------------------------------
    // PASO 5: LISTAR CANCHAS (Módulo Field)
    // ---------------------------------------------------------
    console.log('\n5️⃣  Probando LISTADO DE CANCHAS (/fields)...');
    const fieldsRes = await fetch(`${API_URL}/fields`, { method: 'GET' });
    const fieldsData = await fieldsRes.json();

    if (!fieldsRes.ok) throw new Error('Error al obtener canchas');

    console.log(`   ✅ Se encontraron ${fieldsData.length} canchas.`);
    if (fieldsData.length > 0) {
      console.log(`   🏟️  Ejemplo: ${fieldsData[0].name} - S/${fieldsData[0].price}/h`);
    } else {
      console.log('   ⚠️  No hay canchas creadas aún (Ejecuta seed-geo.ts para crear una).');
    }

    // ---------------------------------------------------------
    // RESUMEN FINAL
    // ---------------------------------------------------------
    console.log('\n✨ --------------------------------------------------- ✨');
    console.log('   PRUEBA EXITOSA: El sistema base funciona correctamente.');
    console.log('   Frontend y Backend pueden comunicarse sin problemas.');
    console.log('✨ --------------------------------------------------- ✨\n');

  } catch (error: any) {
    console.error('\n❌ FALLÓ LA PRUEBA:');
    console.error(error.message);
    process.exit(1);
  }
}

main();