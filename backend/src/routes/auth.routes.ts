import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { 
  registerSchema, 
  loginSchema, 
  socialLoginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from '../schemas/auth.schema';
import { authLimiter, passwordResetLimiter } from '../middlewares/rateLimit.middleware';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Public auth routes (with rate limiting)
router.post('/register', authLimiter, validate({ body: registerSchema }), AuthController.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), AuthController.login);
router.post('/social', authLimiter, validate({ body: socialLoginSchema }), AuthController.socialLogin);

// Token refresh (separate from login rate limit)
router.post('/refresh', validate({ body: refreshTokenSchema }), AuthController.refreshToken);

// Password reset (strict rate limiting)
router.post('/forgot-password', passwordResetLimiter, validate({ body: forgotPasswordSchema }), AuthController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate({ body: resetPasswordSchema }), AuthController.resetPassword);

// Authenticated routes
router.post('/change-password', protect, validate({ body: changePasswordSchema }), AuthController.changePassword);

export default router;