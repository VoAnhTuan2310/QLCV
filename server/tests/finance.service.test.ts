import { getFinanceSummary, getUserTransactions, createTransaction } from '../src/services/finance.service';
import { prisma } from '../src/configs/prisma';

// Mock the Prisma client module
jest.mock('../src/configs/prisma', () => ({
  prisma: {
    transaction: {
      groupBy: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
    },
  },
}));

describe('Finance Service - Unit Tests', () => {
  const mockUserId = 'usr-test-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFinanceSummary', () => {
    it('should correctly calculate totalIncome, totalExpense, and net balance', async () => {
      // 1. Arrange: Mock Prisma groupBy response
      (prisma.transaction.groupBy as jest.Mock).mockResolvedValue([
        {
          type: 'INCOME',
          _sum: { amount: 10000000 },
        },
        {
          type: 'EXPENSE',
          _sum: { amount: 3000000 },
        },
      ]);

      const queryInput = {
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-01-31T23:59:59.999Z',
      };

      // 2. Act
      const summary = await getFinanceSummary(mockUserId, queryInput);

      // 3. Assert
      expect(prisma.transaction.groupBy).toHaveBeenCalledWith({
        by: ['type'],
        where: {
          userId: mockUserId,
          deletedAt: null,
          date: {
            gte: new Date(queryInput.startDate),
            lte: new Date(queryInput.endDate),
          },
        },
        _sum: {
          amount: true,
        },
      });

      expect(summary.totalIncome).toBe(10000000);
      expect(summary.totalExpense).toBe(3000000);
      expect(summary.balance).toBe(7000000);
    });

    it('should return 0 for totalIncome, totalExpense, and balance when user has no transactions', async () => {
      // 1. Arrange: Mock empty groupBy response
      (prisma.transaction.groupBy as jest.Mock).mockResolvedValue([]);

      // 2. Act
      const summary = await getFinanceSummary(mockUserId, {});

      // 3. Assert
      expect(summary.totalIncome).toBe(0);
      expect(summary.totalExpense).toBe(0);
      expect(summary.balance).toBe(0);
    });
  });

  describe('getUserTransactions', () => {
    it('should convert Prisma Decimal amounts to Number in transaction list', async () => {
      // 1. Arrange: Mock findMany returning Decimal objects
      const mockRawTransactions = [
        {
          id: 'tx-1',
          amount: { toString: () => '1500000' }, // Simulating Prisma Decimal
          type: 'INCOME',
          description: 'Salary',
          date: new Date('2026-01-15'),
          categoryId: 'cat-1',
          userId: mockUserId,
          category: { id: 'cat-1', name: 'Salary', icon: 'wallet', color: 'green' },
        },
      ];

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockRawTransactions);

      // 2. Act
      const transactions = await getUserTransactions(mockUserId, {});

      // 3. Assert
      expect(transactions).toHaveLength(1);
      expect(typeof transactions[0].amount).toBe('number');
      expect(transactions[0].amount).toBe(1500000);
    });
  });
});
