import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import financeRoutes from './finance.routes';
import noteRoutes from './note.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/finance', financeRoutes);
router.use('/notes', noteRoutes);

export default router;
