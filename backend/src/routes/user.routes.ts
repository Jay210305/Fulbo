import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas aquí requieren estar logueado
router.get('/profile', protect, UserController.getProfile);
router.put('/profile', protect, UserController.updateProfile);
router.post('/verify-phone', protect, UserController.verifyPhone);
router.post('/promote-to-manager', protect, UserController.promoteToManager);

export default router;