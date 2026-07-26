import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/auth.controller';
import { registerValidator, loginValidator, updateProfileValidator, changePasswordValidator } from '../validators/auth.validator';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Stricter limiter on auth endpoints to slow brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.get('/me', authenticate, authController.me);
router.put('/profile', authenticate, updateProfileValidator, validate, authController.updateProfile);
router.put('/password', authenticate, changePasswordValidator, validate, authController.changePassword);

export default router;
