import { z } from 'zod';
import { TransactionType } from '@prisma/client';

// Category Schemas
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required').max(100),
    type: z.nativeEnum(TransactionType),
    icon: z.string().optional(),
    color: z.string().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Category ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    type: z.nativeEnum(TransactionType).optional(),
    icon: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
  }),
});

// Transaction Schemas
export const createTransactionSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be a positive number'),
    type: z.nativeEnum(TransactionType),
    description: z.string().optional(),
    date: z.string().datetime({ message: 'Invalid ISO date format' }).optional(),
    categoryId: z.string().uuid('Invalid Category ID'),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Transaction ID'),
  }),
  body: z.object({
    amount: z.number().positive().optional(),
    type: z.nativeEnum(TransactionType).optional(),
    description: z.string().optional().nullable(),
    date: z.string().datetime().optional(),
    categoryId: z.string().uuid().optional(),
  }),
});

export const financeSummaryQuerySchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export const transactionQuerySchema = z.object({
  query: z.object({
    type: z.nativeEnum(TransactionType).optional(),
    categoryId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z.enum(['date', 'amount', 'createdAt']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>['body'];
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>['body'];
export type FinanceSummaryQueryInput = z.infer<typeof financeSummaryQuerySchema>['query'];
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>['query'];
