import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../configs/prisma';
import { ApiError } from '../utils/apiError';
import { RegisterInput, LoginInput, AuthResponse } from '../models/auth.model';

// Ensure JWT_SECRET is strictly defined in production environment
const JWT_SECRET = process.env.JWT_SECRET || 'quantum-flow-secret-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * Generate JWT token for authenticated user
 */
const generateToken = (userId: string, email: string, role: string): string => {
  return jwt.sign({ id: userId, email, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

/**
 * Register a new user
 */
export const registerUser = async (input: RegisterInput): Promise<AuthResponse> => {
  const { email, password, fullName } = input;

  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, 'Email address is already registered');
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Create User record
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // 3.5 Auto-seed default finance categories for new user
  await prisma.category.createMany({
    data: [
      { name: 'Ăn Uống / Chi Tiêu', type: 'EXPENSE', userId: user.id },
      { name: 'Lương / Thu Nhập', type: 'INCOME', userId: user.id },
      { name: 'Di Chuyển / Xe Cộ', type: 'EXPENSE', userId: user.id },
      { name: 'Mua Sắm', type: 'EXPENSE', userId: user.id },
      { name: 'Thu Nhập Khác', type: 'INCOME', userId: user.id },
    ],
  });

  // 4. Generate token
  const token = generateToken(user.id, user.email, user.role);

  return {
    user,
    token,
  };
};

/**
 * Authenticate existing user (Login)
 */
export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
  const { email, password } = input;

  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // 2. Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // 3. Generate token
  const token = generateToken(user.id, user.email, user.role);

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

/**
 * Get User Profile by ID
 */
export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};
