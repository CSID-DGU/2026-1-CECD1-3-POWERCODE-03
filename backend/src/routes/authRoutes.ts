import { Router } from 'express';
import { register, login, me, sendVerificationCode, verifyCode } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/send-code', sendVerificationCode);
router.post('/verify-code', verifyCode);
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticateToken as any, me as any);

export default router;
