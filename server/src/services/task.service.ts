import { prisma } from '../configs/prisma';
import { ApiError } from '../utils/apiError';
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from '../models/task.model';
import { Prisma } from '@prisma/client';

/**
 * Get all tasks for a specific user with filtering and sorting
 * Enforces: userId scoping & soft-delete filter (deletedAt: null)
 */
export const getUserTasks = async (userId: string, query: TaskQueryInput) => {
  const { status, priority, sortBy = 'createdAt', order = 'desc' } = query;

  const whereClause: Prisma.TaskWhereInput = {
    userId,
    deletedAt: null, // Soft delete filter
  };

  if (status) {
    whereClause.status = status;
  }

  if (priority) {
    whereClause.priority = priority;
  }

  const tasks = await prisma.task.findMany({
    where: whereClause,
    orderBy: {
      [sortBy]: order,
    },
  });

  return tasks;
};

/**
 * Get a single task by ID
 * Enforces: userId scoping & soft-delete filter
 */
export const getTaskById = async (taskId: string, userId: string) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId, // Security: Ensure ownership
      deletedAt: null,
    },
  });

  if (!task) {
    throw new ApiError(404, 'Task not found or access denied');
  }

  return task;
};

/**
 * Create a new task for a user
 */
export const createNewTask = async (userId: string, input: CreateTaskInput) => {
  const { title, description, status, priority, dueDate } = input;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      userId, // Explicit ownership binding
    },
  });

  return task;
};

/**
 * Update an existing task
 * Enforces: userId scoping & ownership verification before mutation
 */
export const updateTaskById = async (taskId: string, userId: string, input: UpdateTaskInput) => {
  // 1. Verify existence & ownership
  await getTaskById(taskId, userId);

  // 2. Perform update with explicit userId condition
  const { dueDate, ...restInput } = input;

  const updatedTask = await prisma.task.updateMany({
    where: {
      id: taskId,
      userId,
      deletedAt: null,
    },
    data: {
      ...restInput,
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    },
  });

  if (updatedTask.count === 0) {
    throw new ApiError(400, 'Task update failed');
  }

  // 3. Return updated record
  return getTaskById(taskId, userId);
};

/**
 * Soft Delete a task (sets deletedAt = new Date())
 * Enforces: userId scoping & soft delete instead of hard delete
 */
export const softDeleteTaskById = async (taskId: string, userId: string) => {
  // 1. Verify existence & ownership
  await getTaskById(taskId, userId);

  // 2. Perform soft delete
  const result = await prisma.task.updateMany({
    where: {
      id: taskId,
      userId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  if (result.count === 0) {
    throw new ApiError(400, 'Failed to delete task');
  }

  return { id: taskId, message: 'Task deleted successfully' };
};
