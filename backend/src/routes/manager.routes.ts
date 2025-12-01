import { Router } from 'express';
import { ManagerController } from '../controllers/manager.controller';
import { ScheduleBlockController } from '../controllers/schedule-block.controller';
import { StaffController } from '../controllers/staff.controller';
import { PaymentSettingsController } from '../controllers/payment-settings.controller';
import { protect, isManager } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

// Manager schemas
import { 
  createFieldSchema, 
  updateFieldSchema,
  createPromotionSchema,
  updatePromotionSchema,
  createProductSchema,
  updateProductSchema,
  toggleActiveSchema,
  updateBusinessProfileSchema,
  idParamSchema,
  fieldIdParamSchema,
  bookingsQuerySchema,
  statsQuerySchema,
  chartQuerySchema
} from '../schemas/manager.schema';

// Schedule Block schemas
import { 
  createScheduleBlockSchema, 
  blockIdParamSchema,
  fieldIdParamSchema as scheduleFieldIdParamSchema,
  scheduleBlocksQuerySchema 
} from '../schemas/schedule-block.schema';

// Staff schemas
import { 
  createStaffSchema, 
  updateStaffSchema, 
  toggleActiveSchema as staffToggleActiveSchema,
  staffIdParamSchema 
} from '../schemas/staff.schema';

// Payment Settings schemas
import { updatePaymentSettingsSchema } from '../schemas/payment-settings.schema';

const router = Router();

// All routes require authentication and manager role
router.use(protect);
router.use(isManager);

// ==================== FIELD ROUTES ====================

// GET /api/manager/fields - List manager's fields
router.get('/fields', ManagerController.getMyFields);

// GET /api/manager/fields/:id - Get a specific field
router.get('/fields/:id', validate({ params: idParamSchema }), ManagerController.getMyField);

// POST /api/manager/fields - Create a new field
router.post('/fields', validate({ body: createFieldSchema }), ManagerController.createField);

// PUT /api/manager/fields/:id - Update a field
router.put('/fields/:id', validate({ params: idParamSchema, body: updateFieldSchema }), ManagerController.updateField);

// DELETE /api/manager/fields/:id - Soft delete a field
router.delete('/fields/:id', validate({ params: idParamSchema }), ManagerController.deleteField);

// ==================== SCHEDULE BLOCK ROUTES ====================

// GET /api/manager/schedule/blocks - List all schedule blocks for all manager's fields
router.get('/schedule/blocks', validate({ query: scheduleBlocksQuerySchema }), ScheduleBlockController.getAllBlocks);

// GET /api/manager/fields/:fieldId/schedule/blocks - List schedule blocks for a specific field
router.get('/fields/:fieldId/schedule/blocks', validate({ params: scheduleFieldIdParamSchema, query: scheduleBlocksQuerySchema }), ScheduleBlockController.getBlocksByField);

// GET /api/manager/schedule/blocks/:id - Get a specific schedule block
router.get('/schedule/blocks/:id', validate({ params: blockIdParamSchema }), ScheduleBlockController.getBlock);

// POST /api/manager/schedule/block - Create a schedule block
router.post('/schedule/block', validate({ body: createScheduleBlockSchema }), ScheduleBlockController.createBlock);

// DELETE /api/manager/schedule/block/:id - Delete a schedule block
router.delete('/schedule/block/:id', validate({ params: blockIdParamSchema }), ScheduleBlockController.deleteBlock);

// ==================== PROMOTION ROUTES ====================

// GET /api/manager/fields/:fieldId/promotions - List promotions for a field
router.get('/fields/:fieldId/promotions', validate({ params: fieldIdParamSchema }), ManagerController.getPromotions);

// POST /api/manager/fields/:fieldId/promotions - Create a promotion for a field
router.post('/fields/:fieldId/promotions', validate({ params: fieldIdParamSchema, body: createPromotionSchema }), ManagerController.createPromotion);

// GET /api/manager/promotions/:id - Get a specific promotion
router.get('/promotions/:id', validate({ params: idParamSchema }), ManagerController.getPromotion);

// PUT /api/manager/promotions/:id - Update a promotion
router.put('/promotions/:id', validate({ params: idParamSchema, body: updatePromotionSchema }), ManagerController.updatePromotion);

// DELETE /api/manager/promotions/:id - Soft delete a promotion
router.delete('/promotions/:id', validate({ params: idParamSchema }), ManagerController.deletePromotion);

// PATCH /api/manager/promotions/:id/deactivate - Deactivate a promotion
router.patch('/promotions/:id/deactivate', validate({ params: idParamSchema }), ManagerController.deactivatePromotion);

// ==================== PRODUCT ROUTES ====================

// GET /api/manager/fields/:fieldId/products - List products for a field
router.get('/fields/:fieldId/products', validate({ params: fieldIdParamSchema }), ManagerController.getProducts);

// POST /api/manager/fields/:fieldId/products - Create a product for a field
router.post('/fields/:fieldId/products', validate({ params: fieldIdParamSchema, body: createProductSchema }), ManagerController.createProduct);

// GET /api/manager/products/:id - Get a specific product
router.get('/products/:id', validate({ params: idParamSchema }), ManagerController.getProduct);

// PUT /api/manager/products/:id - Update a product
router.put('/products/:id', validate({ params: idParamSchema, body: updateProductSchema }), ManagerController.updateProduct);

// DELETE /api/manager/products/:id - Soft delete a product
router.delete('/products/:id', validate({ params: idParamSchema }), ManagerController.deleteProduct);

// PATCH /api/manager/products/:id/toggle-active - Toggle product active status
router.patch('/products/:id/toggle-active', validate({ params: idParamSchema, body: toggleActiveSchema }), ManagerController.toggleProductActive);

// ==================== BUSINESS PROFILE ROUTES ====================

// GET /api/manager/profile - Get manager's business profile
router.get('/profile', ManagerController.getBusinessProfile);

// PUT /api/manager/profile - Create or update manager's business profile
router.put('/profile', validate({ body: updateBusinessProfileSchema }), ManagerController.updateBusinessProfile);

// ==================== BOOKINGS ROUTES ====================

// GET /api/manager/bookings - List all bookings for manager's fields
router.get('/bookings', validate({ query: bookingsQuerySchema }), ManagerController.getBookings);

// ==================== STATS ROUTES ====================

// GET /api/manager/stats - Get dashboard statistics
router.get('/stats', validate({ query: statsQuerySchema }), ManagerController.getStats);

// GET /api/manager/stats/chart - Get revenue chart data
router.get('/stats/chart', validate({ query: chartQuerySchema }), ManagerController.getChartData);

// ==================== STAFF ROUTES ====================

// GET /api/manager/staff - List all staff members
router.get('/staff', StaffController.getStaff);

// GET /api/manager/staff/:id - Get a specific staff member
router.get('/staff/:id', validate({ params: staffIdParamSchema }), StaffController.getStaffMember);

// POST /api/manager/staff - Create a new staff member
router.post('/staff', validate({ body: createStaffSchema }), StaffController.createStaff);

// PUT /api/manager/staff/:id - Update a staff member
router.put('/staff/:id', validate({ params: staffIdParamSchema, body: updateStaffSchema }), StaffController.updateStaff);

// DELETE /api/manager/staff/:id - Delete a staff member
router.delete('/staff/:id', validate({ params: staffIdParamSchema }), StaffController.deleteStaff);

// PATCH /api/manager/staff/:id/toggle-active - Toggle staff active status
router.patch('/staff/:id/toggle-active', validate({ params: staffIdParamSchema, body: staffToggleActiveSchema }), StaffController.toggleActive);

// ==================== PAYMENT SETTINGS ROUTES ====================

// GET /api/manager/payment-settings - Get payment settings
router.get('/payment-settings', PaymentSettingsController.getSettings);

// PUT /api/manager/payment-settings - Update payment settings
router.put('/payment-settings', validate({ body: updatePaymentSettingsSchema }), PaymentSettingsController.updateSettings);

export default router;
