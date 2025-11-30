import { Router } from 'express';
import { ManagerController } from '../controllers/manager.controller';
import { ScheduleBlockController } from '../controllers/schedule-block.controller';
import { protect, isManager } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication and manager role
router.use(protect);
router.use(isManager);

// ==================== FIELD ROUTES ====================

// GET /api/manager/fields - List manager's fields
router.get('/fields', ManagerController.getMyFields);

// GET /api/manager/fields/:id - Get a specific field
router.get('/fields/:id', ManagerController.getMyField);

// POST /api/manager/fields - Create a new field
router.post('/fields', ManagerController.createField);

// PUT /api/manager/fields/:id - Update a field
router.put('/fields/:id', ManagerController.updateField);

// DELETE /api/manager/fields/:id - Soft delete a field
router.delete('/fields/:id', ManagerController.deleteField);

// ==================== SCHEDULE BLOCK ROUTES ====================

// GET /api/manager/schedule/blocks - List all schedule blocks for all manager's fields
router.get('/schedule/blocks', ScheduleBlockController.getAllBlocks);

// GET /api/manager/fields/:fieldId/schedule/blocks - List schedule blocks for a specific field
router.get('/fields/:fieldId/schedule/blocks', ScheduleBlockController.getBlocksByField);

// GET /api/manager/schedule/blocks/:id - Get a specific schedule block
router.get('/schedule/blocks/:id', ScheduleBlockController.getBlock);

// POST /api/manager/schedule/block - Create a schedule block
router.post('/schedule/block', ScheduleBlockController.createBlock);

// DELETE /api/manager/schedule/block/:id - Delete a schedule block
router.delete('/schedule/block/:id', ScheduleBlockController.deleteBlock);

// ==================== PROMOTION ROUTES ====================

// GET /api/manager/fields/:fieldId/promotions - List promotions for a field
router.get('/fields/:fieldId/promotions', ManagerController.getPromotions);

// POST /api/manager/fields/:fieldId/promotions - Create a promotion for a field
router.post('/fields/:fieldId/promotions', ManagerController.createPromotion);

// GET /api/manager/promotions/:id - Get a specific promotion
router.get('/promotions/:id', ManagerController.getPromotion);

// PUT /api/manager/promotions/:id - Update a promotion
router.put('/promotions/:id', ManagerController.updatePromotion);

// DELETE /api/manager/promotions/:id - Soft delete a promotion
router.delete('/promotions/:id', ManagerController.deletePromotion);

// PATCH /api/manager/promotions/:id/deactivate - Deactivate a promotion
router.patch('/promotions/:id/deactivate', ManagerController.deactivatePromotion);

// ==================== PRODUCT ROUTES ====================

// GET /api/manager/fields/:fieldId/products - List products for a field
router.get('/fields/:fieldId/products', ManagerController.getProducts);

// POST /api/manager/fields/:fieldId/products - Create a product for a field
router.post('/fields/:fieldId/products', ManagerController.createProduct);

// GET /api/manager/products/:id - Get a specific product
router.get('/products/:id', ManagerController.getProduct);

// PUT /api/manager/products/:id - Update a product
router.put('/products/:id', ManagerController.updateProduct);

// DELETE /api/manager/products/:id - Soft delete a product
router.delete('/products/:id', ManagerController.deleteProduct);

// PATCH /api/manager/products/:id/toggle-active - Toggle product active status
router.patch('/products/:id/toggle-active', ManagerController.toggleProductActive);

export default router;
