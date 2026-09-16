import { Router } from 'express';
import { getTasks, getTaskById, createTask, updateTask, deleteTask } from '../../controllers/task.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createTaskSchema, updateTaskSchema, getTaskParamsSchema, queryTaskSchema } from '../../models/task.model';

const router = Router();

// Protect all task endpoints with authentication middleware
router.use(authenticate);

/**
 * @route   GET /api/v1/tasks
 * @desc    Get all tasks for logged in user (supports filtering by status, priority, sorting)
 * @access  Private
 */
router.get('/', validate(queryTaskSchema), getTasks);

/**
 * @route   POST /api/v1/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', validate(createTaskSchema), createTask);

/**
 * @route   GET /api/v1/tasks/:id
 * @desc    Get single task detail by ID
 * @access  Private
 */
router.get('/:id', validate(getTaskParamsSchema), getTaskById);

/**
 * @route   PUT /api/v1/tasks/:id
 * @desc    Update task details by ID
 * @access  Private
 */
router.put('/:id', validate(updateTaskSchema), updateTask);

/**
 * @route   DELETE /api/v1/tasks/:id
 * @desc    Soft Delete task by ID (sets deletedAt)
 * @access  Private
 */
router.delete('/:id', validate(getTaskParamsSchema), deleteTask);

export default router;
