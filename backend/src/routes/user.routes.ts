import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateProfileSchema, verifyPhoneSchema } from '../schemas/user.schema';

const router = Router();

// Todas las rutas aquí requieren estar logueado
router.get('/profile', protect, UserController.getProfile);
router.put('/profile', protect, validate({ body: updateProfileSchema }), UserController.updateProfile);
router.post('/verify-phone', protect, validate({ body: verifyPhoneSchema }), UserController.verifyPhone);
router.post('/promote-to-manager', protect, UserController.promoteToManager);

export default router;