import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password must not exceed 100 characters'),
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters long')
      .max(50, 'Full name must not exceed 50 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}
