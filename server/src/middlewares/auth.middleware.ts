import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'quantum-flow-secret-key-2026';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Unauthorized: Access token missing or invalid'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
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
