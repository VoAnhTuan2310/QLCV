import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} from '../../controllers/finance.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  financeSummaryQuerySchema,
} from '../../models/finance.model';

const router = Router();

// Protect all finance routes with authentication middleware
router.use(authenticate);

// ==============================================================================
// CATEGORY ROUTES (/api/v1/finance/categories)
// ==============================================================================
router.get('/categories', getCategories);
router.post('/categories', validate(createCategorySchema), createCategory);
router.put('/categories/:id', validate(updateCategorySchema), updateCategory);
router.delete('/categories/:id', deleteCategory);

// ==============================================================================
// TRANSACTION ROUTES (/api/v1/finance/transactions)
// ==============================================================================
router.get('/transactions', validate(transactionQuerySchema), getTransactions);
router.post('/transactions', validate(createTransactionSchema), createTransaction);
router.get('/transactions/:id', getTransactionById);
router.put('/transactions/:id', validate(updateTransactionSchema), updateTransaction);
router.delete('/transactions/:id', deleteTransaction);

// ==============================================================================
// FINANCE SUMMARY ROUTE (/api/v1/finance/summary)
// ==============================================================================
router.get('/summary', validate(financeSummaryQuerySchema), getSummary);

export default router;
