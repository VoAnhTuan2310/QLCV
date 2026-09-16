// Backend Unit Test: Finance Service Balance Calculation

describe('Finance Service Logic', () => {
  const calculateBalance = (transactions: { amount: number; type: 'INCOME' | 'EXPENSE' }[]) => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'INCOME') return acc + curr.amount;
      if (curr.type === 'EXPENSE') return acc - curr.amount;
      return acc;
    }, 0);
  };

  it('should correctly calculate net balance from income and expense transactions', () => {
    const mockTransactions = [
      { amount: 10000000, type: 'INCOME' as const },
      { amount: 3000000, type: 'EXPENSE' as const },
      { amount: 1500000, type: 'EXPENSE' as const },
    ];

    const balance = calculateBalance(mockTransactions);
    expect(balance).toBe(5500000);
  });

  it('should return zero when transactions list is empty', () => {
    const balance = calculateBalance([]);
    expect(balance).toBe(0);
  });
});
