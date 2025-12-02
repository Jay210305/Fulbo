import { Router } from 'express';
import { FieldController } from '../controllers/field.controller';
import { validate } from '../middlewares/validate.middleware';
import { searchQuerySchema, fieldIdParamSchema, availabilityQuerySchema } from '../schemas/field.schema';

const router = Router();

// GET http://localhost:3000/api/fields
router.get('/', validate({ query: searchQuerySchema }), FieldController.getFields);
router.get('/:id', validate({ params: fieldIdParamSchema }), FieldController.getFieldDetail);
router.get('/:id/availability', validate({ params: fieldIdParamSchema, query: availabilityQuerySchema }), FieldController.getFieldAvailability);

export default router;