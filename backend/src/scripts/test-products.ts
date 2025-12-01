/**
 * Test script for Products CRUD operations (FulVaso Module)
 * 
 * Usage: npx ts-node src/scripts/test-products.ts
 * 
 * Make sure you have run test-manager-fields.ts first to have a manager and field.
 */

import { prisma } from '../config/prisma';
import { ManagerService } from '../services/manager.service';
import { product_category } from '@prisma/client';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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
  log(`🍺 ${message}`, COLORS.yellow);
  console.log('='.repeat(60));
}

function logProduct(product: any) {
  console.log(`
  📦 Product Details:
     ID: ${product.product_id}
     Name: ${product.name}
     Description: ${product.description || 'N/A'}
     Price: S/ ${Number(product.price).toFixed(2)}
     Category: ${product.category}
     Active: ${product.is_active ? '✅' : '❌'}
     Image: ${product.image_url || 'No image'}
  `);
}

async function getOrCreateManagerAndField() {
  // Get existing manager
  let manager = await prisma.users.findFirst({
    where: { role: 'manager' },
  });

  if (!manager) {
    logInfo('No manager found. Creating a test manager...');
    manager = await prisma.users.create({
      data: {
        email: 'test-manager@fulbo.com',
        first_name: 'Test',
        last_name: 'Manager',
        role: 'manager',
        password_hash: '$2b$10$dummyhashfortest',
      },
    });
    logSuccess(`Created manager: ${manager.email}`);
  }

  // Get or create a field for the manager
  let field = await prisma.fields.findFirst({
    where: {
      owner_id: manager.user_id,
      deleted_at: null,
    },
  });

  if (!field) {
    logInfo('No field found. Creating a test field...');
    field = await prisma.fields.create({
      data: {
        owner_id: manager.user_id,
        name: 'Cancha FulVaso Test',
        address: 'Av. Productos 456, Lima',
        description: 'Cancha con servicio de productos',
        base_price_per_hour: 50.00,
        amenities: { floodlights: true, parking: true },
      },
    });
    logSuccess(`Created field: ${field.name}`);
  }

  return { manager, field };
}

async function cleanupPreviousTestProducts(fieldId: string) {
  logInfo('Cleaning up previous test products...');
  
  const deleted = await prisma.products.deleteMany({
    where: {
      field_id: fieldId,
      name: { startsWith: 'Test ' },
    },
  });
  
  if (deleted.count > 0) {
    logInfo(`Deleted ${deleted.count} previous test products`);
  }
}

async function testCreateProduct(fieldId: string, ownerId: string) {
  logSection('TEST 1: Create Product');

  const productData = {
    name: 'Test Gatorade',
    description: 'Bebida isotónica 500ml',
    price: 5.50,
    imageUrl: 'https://images.unsplash.com/photo-1629385982145-8c5f9fd7da27?w=400',
    category: 'bebida' as product_category,
  };

  logInfo(`Creating product: ${JSON.stringify(productData, null, 2)}`);

  const product = await ManagerService.createProduct(fieldId, ownerId, productData);

  if (product) {
    logSuccess('Product created successfully!');
    logProduct(product);
    return product;
  } else {
    logError('Failed to create product - field not found or unauthorized');
    return null;
  }
}

async function testCreateMultipleProducts(fieldId: string, ownerId: string) {
  logSection('TEST 2: Create Multiple Products (Different Categories)');

  const products = [
    { name: 'Test Agua Mineral', description: 'Agua San Luis 625ml', price: 3.00, category: 'bebida' as product_category },
    { name: 'Test Coca Cola', description: 'Gaseosa 500ml', price: 4.50, category: 'bebida' as product_category },
    { name: 'Test Papas Lays', description: 'Papas fritas clásicas', price: 4.00, category: 'snack' as product_category },
    { name: 'Test Chocolatada', description: 'Gloria 180ml', price: 2.50, category: 'snack' as product_category },
    { name: 'Test Camiseta', description: 'Camiseta de fútbol talla M', price: 35.00, category: 'equipo' as product_category },
    { name: 'Test Canilleras', description: 'Canilleras Nike', price: 25.00, category: 'equipo' as product_category },
    { name: 'Test Combo Hidratación', description: '2 Gatorade + 1 Agua', price: 12.00, category: 'promocion' as product_category },
  ];

  const createdProducts = [];

  for (const productData of products) {
    const product = await ManagerService.createProduct(fieldId, ownerId, productData);
    if (product) {
      logSuccess(`Created: ${product.name} (${product.category}) - S/ ${Number(product.price).toFixed(2)}`);
      createdProducts.push(product);
    } else {
      logError(`Failed to create: ${productData.name}`);
    }
  }

  logInfo(`Total products created: ${createdProducts.length}`);
  return createdProducts;
}

async function testGetProductsByField(fieldId: string, ownerId: string) {
  logSection('TEST 3: Get All Products for Field');

  const products = await ManagerService.getProductsByField(fieldId, ownerId);

  if (products === null) {
    logError('Field not found or unauthorized');
    return [];
  }

  logSuccess(`Found ${products.length} products for this field`);
  
  // Group by category
  const byCategory: Record<string, any[]> = {};
  for (const product of products) {
    if (!byCategory[product.category]) {
      byCategory[product.category] = [];
    }
    byCategory[product.category].push(product);
  }

  for (const [category, prods] of Object.entries(byCategory)) {
    log(`\n  📁 ${category.toUpperCase()} (${prods.length} items):`, COLORS.magenta);
    for (const p of prods) {
      console.log(`     - ${p.name}: S/ ${Number(p.price).toFixed(2)} ${p.is_active ? '✅' : '❌'}`);
    }
  }

  return products;
}

async function testGetProductById(productId: string, ownerId: string) {
  logSection('TEST 4: Get Product by ID');

  logInfo(`Fetching product: ${productId}`);

  const product = await ManagerService.getProductById(productId, ownerId);

  if (product) {
    logSuccess('Product found!');
    logProduct(product);
    logInfo(`Field: ${product.fields.name}`);
    return product;
  } else {
    logError('Product not found or unauthorized');
    return null;
  }
}

async function testUpdateProduct(productId: string, ownerId: string) {
  logSection('TEST 5: Update Product');

  const updateData = {
    name: 'Test Gatorade UPDATED',
    price: 6.00,
    description: 'Bebida isotónica 500ml - PRECIO ACTUALIZADO',
  };

  logInfo(`Updating product ${productId} with: ${JSON.stringify(updateData)}`);

  const product = await ManagerService.updateProduct(productId, ownerId, updateData);

  if (product) {
    logSuccess('Product updated successfully!');
    logProduct(product);
    return product;
  } else {
    logError('Failed to update - product not found or unauthorized');
    return null;
  }
}

async function testToggleProductActive(productId: string, ownerId: string) {
  logSection('TEST 6: Toggle Product Active Status');

  // Deactivate
  logInfo('Deactivating product...');
  let product = await ManagerService.toggleProductActive(productId, ownerId, false);

  if (product) {
    logSuccess(`Product deactivated! is_active: ${product.is_active}`);
  } else {
    logError('Failed to deactivate');
    return null;
  }

  // Reactivate
  logInfo('Reactivating product...');
  product = await ManagerService.toggleProductActive(productId, ownerId, true);

  if (product) {
    logSuccess(`Product reactivated! is_active: ${product.is_active}`);
    return product;
  } else {
    logError('Failed to reactivate');
    return null;
  }
}

async function testDeleteProduct(productId: string, ownerId: string) {
  logSection('TEST 7: Delete Product (Soft Delete)');

  logInfo(`Deleting product: ${productId}`);

  const product = await ManagerService.deleteProduct(productId, ownerId);

  if (product) {
    logSuccess('Product deleted (soft delete)!');
    logInfo(`deleted_at: ${product.deleted_at}`);
    logInfo(`is_active: ${product.is_active}`);

    // Verify it doesn't appear in list
    const products = await ManagerService.getProductsByField(product.field_id, ownerId);
    const stillExists = products?.find(p => p.product_id === productId);
    
    if (!stillExists) {
      logSuccess('Confirmed: Deleted product does not appear in product list');
    } else {
      logError('Error: Deleted product still appears in list');
    }

    return product;
  } else {
    logError('Failed to delete - product not found or unauthorized');
    return null;
  }
}

async function testUnauthorizedAccess(fieldId: string, productId: string) {
  logSection('TEST 8: Unauthorized Access (Different Owner)');

  // Create a fake owner ID
  const fakeOwnerId = '00000000-0000-0000-0000-000000000000';

  logInfo('Attempting to access products with wrong owner ID...');

  // Try to get products
  const products = await ManagerService.getProductsByField(fieldId, fakeOwnerId);
  if (products === null) {
    logSuccess('Correctly denied access to get products');
  } else {
    logError('Security issue: Allowed access with wrong owner');
  }

  // Try to update product
  const updated = await ManagerService.updateProduct(productId, fakeOwnerId, { name: 'Hacked!' });
  if (updated === null) {
    logSuccess('Correctly denied access to update product');
  } else {
    logError('Security issue: Allowed update with wrong owner');
  }

  // Try to delete product
  const deleted = await ManagerService.deleteProduct(productId, fakeOwnerId);
  if (deleted === null) {
    logSuccess('Correctly denied access to delete product');
  } else {
    logError('Security issue: Allowed delete with wrong owner');
  }
}

async function runTests() {
  console.log('\n');
  log('🍺🍺🍺 FULVASO PRODUCTS TEST SCRIPT 🍺🍺🍺', COLORS.magenta);
  console.log('='.repeat(60));

  try {
    // Setup
    const { manager, field } = await getOrCreateManagerAndField();
    logSuccess(`Manager: ${manager.first_name} ${manager.last_name} (${manager.email})`);
    logSuccess(`Field: ${field.name} (${field.field_id})`);

    // Cleanup previous test data
    await cleanupPreviousTestProducts(field.field_id);

    // Run tests
    const createdProduct = await testCreateProduct(field.field_id, manager.user_id);
    if (!createdProduct) {
      logError('Cannot continue without created product');
      return;
    }

    await testCreateMultipleProducts(field.field_id, manager.user_id);
    await testGetProductsByField(field.field_id, manager.user_id);
    await testGetProductById(createdProduct.product_id, manager.user_id);
    await testUpdateProduct(createdProduct.product_id, manager.user_id);
    await testToggleProductActive(createdProduct.product_id, manager.user_id);

    // Get another product for unauthorized test before deleting the first one
    const products = await ManagerService.getProductsByField(field.field_id, manager.user_id);
    const anotherProduct = products?.find(p => p.product_id !== createdProduct.product_id);

    await testDeleteProduct(createdProduct.product_id, manager.user_id);

    if (anotherProduct) {
      await testUnauthorizedAccess(field.field_id, anotherProduct.product_id);
    }

    // Final summary
    logSection('TEST SUMMARY');
    const finalProducts = await ManagerService.getProductsByField(field.field_id, manager.user_id);
    logSuccess(`Total active products in field: ${finalProducts?.length || 0}`);

    log('\n✅ All tests completed successfully!', COLORS.green);

  } catch (error) {
    logError(`Test failed with error: ${error}`);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
runTests();
