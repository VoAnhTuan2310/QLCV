import { Request, Response, NextFunction } from 'express';
import * as financeService from '../services/finance.service';
import { ApiError } from '../utils/apiError';
import { TransactionQueryInput, FinanceSummaryQueryInput } from '../models/finance.model';

// ==============================================================================
// CATEGORY CONTROLLERS
// ==============================================================================

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const categories = await financeService.getUserCategories(req.user.id);
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const category = await financeService.createCategory(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Category created successfully', data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const category = await financeService.updateCategoryById(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, message: 'Category updated successfully', data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const result = await financeService.softDeleteCategoryById(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

// ==============================================================================
// TRANSACTION CONTROLLERS
// ==============================================================================

export const getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const transactions = await financeService.getUserTransactions(req.user.id, req.query as unknown as TransactionQueryInput);
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const transaction = await financeService.getTransactionById(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const transaction = await financeService.createTransaction(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Transaction created successfully', data: transaction });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const updatedTransaction = await financeService.updateTransactionById(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, message: 'Transaction updated successfully', data: updatedTransaction });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const result = await financeService.softDeleteTransactionById(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

// ==============================================================================
// FINANCE SUMMARY CONTROLLER
// ==============================================================================

export const getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const summary = await financeService.getFinanceSummary(req.user.id, req.query as any);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};
