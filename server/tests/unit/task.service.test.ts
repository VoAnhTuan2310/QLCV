// Backend Unit Test: Task Filtering Logic

describe('Task Filtering Logic', () => {
  type Task = { id: string; title: string; status: 'TODO' | 'IN_PROGRESS' | 'DONE' };

  const filterTasksByStatus = (tasks: Task[], statusFilter: string) => {
    if (statusFilter === 'ALL') return tasks;
    return tasks.filter((t) => t.status === statusFilter);
  };

  const sampleTasks: Task[] = [
    { id: '1', title: 'Design DB', status: 'DONE' },
    { id: '2', title: 'Setup Backend', status: 'IN_PROGRESS' },
    { id: '3', title: 'Setup Frontend', status: 'TODO' },
  ];

  it('should filter tasks by IN_PROGRESS status', () => {
    const filtered = filterTasksByStatus(sampleTasks, 'IN_PROGRESS');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('should return all tasks when filter is ALL', () => {
    const filtered = filterTasksByStatus(sampleTasks, 'ALL');
    expect(filtered).toHaveLength(3);
  });
});
