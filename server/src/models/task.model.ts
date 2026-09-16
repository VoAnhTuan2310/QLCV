import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters'),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    dueDate: z.string().datetime({ message: 'Invalid date format (ISO-8601 required)' }).optional().nullable(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional().nullable(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    dueDate: z.string().datetime().optional().nullable(),
  }),
});

export const getTaskParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
});

export const queryTaskSchema = z.object({
  query: z.object({
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    sortBy: z.enum(['dueDate', 'createdAt', 'priority']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
export type TaskQueryInput = z.infer<typeof queryTaskSchema>['query'];
