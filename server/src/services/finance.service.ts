import { prisma } from '../configs/prisma';
import { ApiError } from '../utils/apiError';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionQueryInput,
  FinanceSummaryQueryInput,
} from '../models/finance.model';
import { Prisma } from '@prisma/client';

// ==============================================================================
// CATEGORY SERVICES
// ==============================================================================

/**
 * Get all active categories for a user
 */
export const getUserCategories = async (userId: string) => {
  return prisma.category.findMany({
    where: {
      userId,
      deletedAt: null, // Soft delete filter
    },
    orderBy: {
      name: 'asc',
    },
  });
};

/**
 * Get category by ID with ownership validation
 */
export const getCategoryById = async (categoryId: string, userId: string) => {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
      deletedAt: null,
    },
  });

  if (!category) {
    throw new ApiError(404, 'Category not found or access denied');
  }

  return category;
};

/**
 * Create a new finance category
 */
export const createCategory = async (userId: string, input: CreateCategoryInput) => {
  return prisma.category.create({
    data: {
      ...input,
      userId,
    },
  });
};

/**
 * Update category by ID
 */
export const updateCategoryById = async (categoryId: string, userId: string, input: UpdateCategoryInput) => {
  await getCategoryById(categoryId, userId);

  await prisma.category.updateMany({
    where: {
      id: categoryId,
      userId,
      deletedAt: null,
    },
    data: input,
  });

  return getCategoryById(categoryId, userId);
};

/**
 * Soft Delete category (sets deletedAt = new Date())
 */
export const softDeleteCategoryById = async (categoryId: string, userId: string) => {
  await getCategoryById(categoryId, userId);

  const result = await prisma.category.updateMany({
    where: {
      id: categoryId,
      userId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  if (result.count === 0) {
    throw new ApiError(400, 'Failed to delete category');
  }

  return { id: categoryId, message: 'Category deleted successfully' };
};

// ==============================================================================
// TRANSACTION SERVICES
// ==============================================================================

/**
 * Helper: Format transaction record to convert Decimal amount to Number
 */
const formatTransaction = (transaction: any) => ({
  ...transaction,
  amount: Number(transaction.amount),
});

/**
 * Get user transactions with date filtering, category filtering, and sorting
 */
export const getUserTransactions = async (userId: string, query: TransactionQueryInput) => {
  const { type, categoryId, startDate, endDate, sortBy = 'date', order = 'desc' } = query;

  const whereClause: Prisma.TransactionWhereInput = {
    userId,
    deletedAt: null, // Soft delete filter
  };

  if (type) whereClause.type = type;
  if (categoryId) whereClause.categoryId = categoryId;

  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) whereClause.date.gte = new Date(startDate);
    if (endDate) whereClause.date.lte = new Date(endDate);
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
    },
    orderBy: {
      [sortBy]: order,
    },
  });

  return transactions.map(formatTransaction);
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (transactionId: string, userId: string) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
      deletedAt: null,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found or access denied');
  }

  return formatTransaction(transaction);
};

/**
 * Create a new income/expense transaction
 */
export const createTransaction = async (userId: string, input: CreateTransactionInput) => {
  const { amount, type, description, date, categoryId } = input;

  // Verify category belongs to user & is active
  await getCategoryById(categoryId, userId);

  const transaction = await prisma.transaction.create({
    data: {
      amount: new Prisma.Decimal(amount), // High precision Decimal
      type,
      description,
      date: date ? new Date(date) : new Date(),
      categoryId,
      userId,
    },
    include: {
      category: true,
    },
  });

  return formatTransaction(transaction);
};

/**
 * Update transaction by ID
 */
export const updateTransactionById = async (
  transactionId: string,
  userId: string,
  input: UpdateTransactionInput
) => {
  await getTransactionById(transactionId, userId);

  if (input.categoryId) {
    await getCategoryById(input.categoryId, userId);
  }

  const { amount, date, ...rest } = input;

  const updateData: Prisma.TransactionUpdateInput = {
    ...rest,
    ...(amount !== undefined && { amount: new Prisma.Decimal(amount) }),
    ...(date !== undefined && { date: new Date(date) }),
  };

  await prisma.transaction.updateMany({
    where: {
      id: transactionId,
      userId,
      deletedAt: null,
    },
    data: updateData as any,
  });

  return getTransactionById(transactionId, userId);
};

/**
 * Soft Delete transaction
 */
export const softDeleteTransactionById = async (transactionId: string, userId: string) => {
  await getTransactionById(transactionId, userId);

  const result = await prisma.transaction.updateMany({
    where: {
      id: transactionId,
      userId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  if (result.count === 0) {
    throw new ApiError(400, 'Failed to delete transaction');
  }

  return { id: transactionId, message: 'Transaction deleted successfully' };
};

// ==============================================================================
// FINANCE SUMMARY & ANALYTICS SERVICE
// ==============================================================================

/**
 * Calculate Total Income, Total Expense, and Net Balance for a specified date range
 * Enforces: userId scoping & soft-delete filter (deletedAt: null)
 */
export const getFinanceSummary = async (userId: string, query: FinanceSummaryQueryInput) => {
  const { startDate, endDate } = query;

  const whereClause: Prisma.TransactionWhereInput = {
    userId,
    deletedAt: null,
  };

  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) whereClause.date.gte = new Date(startDate);
    if (endDate) whereClause.date.lte = new Date(endDate);
  }

  // Aggregate total income & expense using Prisma aggregate
  const summaryGroup = await prisma.transaction.groupBy({
    by: ['type'],
    where: whereClause,
    _sum: {
      amount: true,
    },
  });

  let totalIncome = 0;
  let totalExpense = 0;

  summaryGroup.forEach((group) => {
    const sum = group._sum.amount ? Number(group._sum.amount) : 0;
    if (group.type === 'INCOME') {
      totalIncome = sum;
    } else if (group.type === 'EXPENSE') {
      totalExpense = sum;
    }
  });

  const balance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    balance,
    period: {
      startDate: startDate || null,
      endDate: endDate || null,
    },
  };
};
