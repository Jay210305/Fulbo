import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

// POST http://localhost:3000/api/auth/register
router.post('/register', AuthController.register);

export default router;