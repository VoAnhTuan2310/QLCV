import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Unauthorized: Access token missing or invalid'));
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return next(new ApiError(500, 'Internal Server Error: JWT configuration missing'));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return next(new ApiError(401, 'Unauthorized: Invalid or expired token'));
  }
};
