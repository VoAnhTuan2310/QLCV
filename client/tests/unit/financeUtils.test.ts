// Frontend Vitest Unit Test: Currency & Balance Formatters

describe('Finance Formatting Utilities', () => {
  const formatCurrencyVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  it('should correctly format currency numbers to VND string format', () => {
    const formatted = formatCurrencyVND(500000);
    expect(formatted).toContain('500.000');
  });
});
