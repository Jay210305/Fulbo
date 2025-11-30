import { Router } from 'express';
import { FieldController } from '../controllers/field.controller';

const router = Router();

// GET http://localhost:3000/api/fields
router.get('/', FieldController.getFields);
router.get('/:id', FieldController.getFieldDetail);
router.get('/:id/availability', FieldController.getFieldAvailability);

export default router;