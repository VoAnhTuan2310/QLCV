import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/task.service';
import { ApiError } from '../utils/apiError';
import { TaskQueryInput } from '../models/task.model';

/**
 * Handle Get List of Tasks for Logged In User
 */
export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized: User not authenticated');
    }

    const userId = req.user.id;
    const tasks = await taskService.getUserTasks(userId, req.query as unknown as TaskQueryInput);

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Get Task Detail by ID
 */
export const getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized: User not authenticated');
    }

    const userId = req.user.id;
    const { id } = req.params;
    const task = await taskService.getTaskById(id, userId);

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Create New Task
 */
export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized: User not authenticated');
    }

    const userId = req.user.id;
    const task = await taskService.createNewTask(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Update Task
 */
export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized: User not authenticated');
    }

    const userId = req.user.id;
    const { id } = req.params;
    const updatedTask = await taskService.updateTaskById(id, userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Delete Task (Soft Delete)
 */
export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized: User not authenticated');
    }

    const userId = req.user.id;
    const { id } = req.params;
    const result = await taskService.softDeleteTaskById(id, userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
