import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

// POST http://localhost:3000/api/auth/register
router.post('/register', AuthController.register);
router.post('/login', AuthController.login); // <--- AGREGAR ESTA LÍNEA
router.post('/social', AuthController.socialLogin); // <--- Social Login (Google/Facebook)

export default router;