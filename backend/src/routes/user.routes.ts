import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import { getAllUsers, getUserById, updateUserRole, deleteUser } from '../controllers/user.controller';

const router = Router();

router.use(authenticateToken);
router.use(authorize('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;