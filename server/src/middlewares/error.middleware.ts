import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err instanceof ApiError ? err.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // Handle Prisma Database Connection / Schema Errors
  if (err.code === 'P1001') {
    statusCode = 503;
    message = 'Không thể kết nối đến Cơ sở dữ liệu PostgreSQL. Vui lòng kiểm tra Server Postgres!';
  } else if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Dữ liệu đã tồn tại trong hệ thống (Email đã được đăng ký)!';
  } else if (err.code === 'P2021' || err.code === 'P2022') {
    statusCode = 500;
    message = 'Chưa khởi tạo bảng Database. Vui lòng chạy lệnh: npx prisma migrate dev --name init';
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
