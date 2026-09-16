import { Router } from 'express';
import { register, login, getMe } from '../../controllers/auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../../models/auth.model';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(registerSchema), register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & get JWT token
 * @access  Public
 */
router.post('/login', validate(loginSchema), login);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get logged in user profile
 * @access  Private (Requires Bearer token)
 */
router.get('/me', authenticate, getMe);

export default router;
