import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, socialLoginSchema } from '../schemas/auth.schema';

const router = Router();

// POST http://localhost:3000/api/auth/register
router.post('/register', validate({ body: registerSchema }), AuthController.register);
router.post('/login', validate({ body: loginSchema }), AuthController.login);
router.post('/social', validate({ body: socialLoginSchema }), AuthController.socialLogin);

export default router;