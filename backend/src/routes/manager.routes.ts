import { Router } from 'express';
import { ManagerController } from '../controllers/manager.controller';
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

export default router;
