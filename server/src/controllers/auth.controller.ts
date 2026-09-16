import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { ApiError } from '../utils/apiError';

/**
 * Handle User Registration
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle User Login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Get Current User Profile
 */
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized: User not authenticated');
    }

    const userId = req.user.id;
    const user = await authService.getUserProfile(userId);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
