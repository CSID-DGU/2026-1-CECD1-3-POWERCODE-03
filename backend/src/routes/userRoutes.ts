import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all user management routes - Admin only
router.use(authenticateToken as any);
router.use(requireAdmin as any);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
