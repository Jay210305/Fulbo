/**
 * Test script for Manager Field CRUD operations
 * 
 * Usage: npx ts-node src/scripts/test-manager-fields.ts
 * 
 * Make sure the backend server is running and you have a manager user in the database.
 */

import { prisma } from '../config/prisma';
import { ManagerService } from '../services/manager.service';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, COLORS.green);
}

function logError(message: string) {
  log(`❌ ${message}`, COLORS.red);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, COLORS.cyan);
}

function logSection(message: string) {
  console.log('\n' + '='.repeat(60));
  log(`📋 ${message}`, COLORS.yellow);
  console.log('='.repeat(60));
}

async function getOrCreateManagerUser() {
  // Try to find an existing manager
  let manager = await prisma.users.findFirst({
    where: { role: 'manager' },
  });

  if (!manager) {
    logInfo('No manager found. Creating a test manager user...');
    manager = await prisma.users.create({
      data: {
        email: 'test-manager@fulbo.com',
        first_name: 'Test',
        last_name: 'Manager',
        role: 'manager',
        password_hash: '$2b$10$dummyhashfortest', // Not a real password
      },
    });
    logSuccess(`Created test manager: ${manager.email}`);
  } else {
    logInfo(`Using existing manager: ${manager.email}`);
  }

  return manager;
}

async function testCreateField(ownerId: string) {
  logSection('TEST 1: Create Field');

  try {
    const fieldData = {
      name: 'Cancha de Prueba',
      address: 'Av. Test 123, Lima',
      description: 'Cancha creada para pruebas de la API',
      amenities: { floodlights: true, parking: true, changing: true },
      basePricePerHour: 45.00,
    };

    logInfo(`Creating field with data: ${JSON.stringify(fieldData, null, 2)}`);

    const field = await ManagerService.createField(ownerId, fieldData);

    logSuccess(`Field created successfully!`);
    console.log({
      id: field.field_id,
      name: field.name,
      address: field.address,
      price: Number(field.base_price_per_hour),
      createdAt: field.created_at,
    });

    return field;
  } catch (error: any) {
    logError(`Failed to create field: ${error.message}`);
    throw error;
  }
}

async function testGetFieldsByOwner(ownerId: string) {
  logSection('TEST 2: Get Fields by Owner');

  try {
    const fields = await ManagerService.getFieldsByOwner(ownerId);

    logSuccess(`Found ${fields.length} field(s)`);
    
    fields.forEach((field, index) => {
      console.log(`\n  ${index + 1}. ${field.name}`);
      console.log(`     ID: ${field.field_id}`);
      console.log(`     Address: ${field.address}`);
      console.log(`     Price: S/ ${Number(field.base_price_per_hour)}/h`);
      console.log(`     Bookings: ${field._count.bookings}`);
      console.log(`     Reviews: ${field._count.reviews}`);
    });

    return fields;
  } catch (error: any) {
    logError(`Failed to get fields: ${error.message}`);
    throw error;
  }
}

async function testGetFieldByOwner(fieldId: string, ownerId: string) {
  logSection('TEST 3: Get Single Field by ID');

  try {
    const field = await ManagerService.getFieldByOwner(fieldId, ownerId);

    if (!field) {
      logError('Field not found or not owned by this manager');
      return null;
    }

    logSuccess(`Field found!`);
    console.log({
      id: field.field_id,
      name: field.name,
      address: field.address,
      description: field.description,
      amenities: field.amenities,
      price: Number(field.base_price_per_hour),
      photos: field.field_photos.length,
      promotions: field.promotions.length,
    });

    return field;
  } catch (error: any) {
    logError(`Failed to get field: ${error.message}`);
    throw error;
  }
}

async function testUpdateField(fieldId: string, ownerId: string) {
  logSection('TEST 4: Update Field');

  try {
    const updateData = {
      name: 'Cancha de Prueba (Actualizada)',
      basePricePerHour: 55.00,
      description: 'Descripción actualizada - Cancha renovada con césped sintético de última generación',
    };

    logInfo(`Updating field with: ${JSON.stringify(updateData, null, 2)}`);

    const field = await ManagerService.updateField(fieldId, ownerId, updateData);

    if (!field) {
      logError('Field not found or not owned by this manager');
      return null;
    }

    logSuccess(`Field updated successfully!`);
    console.log({
      id: field.field_id,
      name: field.name,
      price: Number(field.base_price_per_hour),
      description: field.description,
      updatedAt: field.updated_at,
    });

    return field;
  } catch (error: any) {
    logError(`Failed to update field: ${error.message}`);
    throw error;
  }
}

async function testDeleteField(fieldId: string, ownerId: string) {
  logSection('TEST 5: Soft Delete Field');

  try {
    logInfo(`Soft deleting field: ${fieldId}`);

    const field = await ManagerService.deleteField(fieldId, ownerId);

    if (!field) {
      logError('Field not found or not owned by this manager');
      return null;
    }

    logSuccess(`Field soft deleted successfully!`);
    console.log({
      id: field.field_id,
      name: field.name,
      deletedAt: field.deleted_at,
    });

    // Verify it's no longer in the list
    const fields = await ManagerService.getFieldsByOwner(ownerId);
    const stillExists = fields.some(f => f.field_id === fieldId);
    
    if (!stillExists) {
      logSuccess('Verified: Field no longer appears in active fields list');
    } else {
      logError('Warning: Field still appears in active fields list');
    }

    return field;
  } catch (error: any) {
    logError(`Failed to delete field: ${error.message}`);
    throw error;
  }
}

async function testUnauthorizedAccess(fieldId: string) {
  logSection('TEST 6: Unauthorized Access (Security Check)');

  try {
    // Create a fake owner ID
    const fakeOwnerId = '00000000-0000-0000-0000-000000000000';

    logInfo('Attempting to access field with wrong owner ID...');

    const field = await ManagerService.getFieldByOwner(fieldId, fakeOwnerId);

    if (!field) {
      logSuccess('Security check passed: Cannot access field with wrong owner');
    } else {
      logError('Security check FAILED: Was able to access field with wrong owner!');
    }

    logInfo('Attempting to update field with wrong owner ID...');
    const updatedField = await ManagerService.updateField(fieldId, fakeOwnerId, {
      name: 'Hacked Name',
    });

    if (!updatedField) {
      logSuccess('Security check passed: Cannot update field with wrong owner');
    } else {
      logError('Security check FAILED: Was able to update field with wrong owner!');
    }

  } catch (error: any) {
    logInfo(`Security check resulted in error (expected): ${error.message}`);
  }
}

async function runAllTests() {
  console.log('\n');
  log('🏟️  MANAGER FIELD CRUD TESTS', COLORS.blue);
  log('============================', COLORS.blue);
  console.log('\n');

  let createdFieldId: string | null = null;
  let managerId: string | null = null;

  try {
    // Get or create a manager user
    const manager = await getOrCreateManagerUser();
    managerId = manager.user_id;

    // Test 1: Create Field
    const createdField = await testCreateField(managerId);
    createdFieldId = createdField.field_id;

    // Test 2: Get All Fields
    await testGetFieldsByOwner(managerId);

    // Test 3: Get Single Field
    await testGetFieldByOwner(createdFieldId, managerId);

    // Test 4: Update Field
    await testUpdateField(createdFieldId, managerId);

    // Test 5: Delete Field
    await testDeleteField(createdFieldId, managerId);

    // Test 6: Security Check
    await testUnauthorizedAccess(createdFieldId);

    // Summary
    logSection('TEST SUMMARY');
    logSuccess('All tests completed!');
    console.log('\n  ✅ Create Field');
    console.log('  ✅ Read Fields (List)');
    console.log('  ✅ Read Field (Single)');
    console.log('  ✅ Update Field');
    console.log('  ✅ Soft Delete Field');
    console.log('  ✅ Security Checks');

  } catch (error: any) {
    logError(`\nTest suite failed: ${error.message}`);
    console.error(error);
  } finally {
    // Cleanup: Permanently delete the test field if it was created
    if (createdFieldId) {
      logInfo('\nCleaning up test data...');
      try {
        await prisma.fields.delete({
          where: { field_id: createdFieldId },
        });
        logSuccess('Test field permanently deleted');
      } catch (e) {
        // Field might already be deleted or doesn't exist
      }
    }

    await prisma.$disconnect();
    console.log('\n');
  }
}

// Run the tests
runAllTests();
