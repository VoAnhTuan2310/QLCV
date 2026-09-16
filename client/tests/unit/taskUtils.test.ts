// Frontend Vitest Unit Test: Task Helper Utilities

describe('Task Priority Helper', () => {
  const getPriorityBadgeColor = (priority: string): string => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  it('should return red badge color for URGENT priority', () => {
    expect(getPriorityBadgeColor('URGENT')).toBe('bg-red-500');
  });

  it('should return default blue badge color for LOW priority', () => {
    expect(getPriorityBadgeColor('LOW')).toBe('bg-blue-500');
  });
});
