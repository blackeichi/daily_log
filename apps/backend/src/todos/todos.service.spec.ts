import { ConflictException, ForbiddenException } from '@nestjs/common';
import { TodosService, Operation } from './todos.service';
const empty = { weekList: [], monthList: [], yearList: [], breakLimitList: [] };
const op = (overrides = {}): Operation => ({
  operationId: '12345678-1234-1234-1234-123456789abc',
  expectedRevision: 1,
  action: 'complete',
  itemId: 10,
  isDone: true,
  ...overrides,
});
function setup(items: any[] = [{ id: 10, text: 'read', isDone: false }]) {
  let row: any = {
    id: 1,
    userId: 7,
    revision: 1,
    updatedAt: new Date(),
    todayList: items,
    ...empty,
  };
  const receipts = new Map<string, any>();
  const tx = {
    todo: {
      findUnique: jest.fn(async () => structuredClone(row)),
      create: jest.fn(),
      updateMany: jest.fn(async ({ where, data }) => {
        if (where.revision !== row.revision) return { count: 0 };
        row = { ...row, ...data, revision: row.revision + 1 };
        return { count: 1 };
      }),
    },
    todoMutation: {
      findUnique: jest.fn(async ({ where }) => receipts.get(where.id)),
      create: jest.fn(async ({ data }) => {
        receipts.set(data.id, data);
        return data;
      }),
    },
  };
  return {
    service: new TodosService({
      ...tx,
      $transaction: async (fn: any) => fn(tx),
    } as any),
    tx,
    row: () => row,
  };
}
describe('Todo concurrency and widget operations', () => {
  it('rejects legacy writes without a revision', async () => {
    const { service, tx } = setup();
    await expect(
      service.syncTodos(7, { todayList: [], ...empty }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.todo.updateMany).not.toHaveBeenCalled();
  });
  it('does not allow stale web uploads to undo widget checks', async () => {
    const { service, row } = setup();
    await service.applyOperation(7, op());
    await expect(
      service.syncTodos(7, { todayList: [], ...empty }, 1),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(row().todayList[0].isDone).toBe(true);
  });
  it('applies a retried add exactly once', async () => {
    const { service, tx, row } = setup();
    const add = op({ action: 'add', itemId: 11, text: 'new' });
    await service.applyOperation(7, add);
    await service.applyOperation(7, add);
    expect(row().todayList).toHaveLength(2);
    expect(tx.todo.updateMany).toHaveBeenCalledTimes(1);
  });
  it.each([
    [{ id: 10, text: 'locked', isDisabled: true }],
    [
      {
        id: 10,
        text: 'parent',
        children: [{ id: 11, text: 'locked', isDisabled: true }],
      },
    ],
  ])('protects locked items and descendants', async (item) => {
    await expect(
      setup([item]).service.applyOperation(7, op({ action: 'delete' })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('also enforces locks on bulk writes', async () => {
    const { service } = setup([{ id: 10, text: 'locked', isDisabled: true }]);
    await expect(
      service.syncTodos(7, { todayList: [], ...empty }, 1),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('checks children with parent without losing descriptions', async () => {
    const { service, row } = setup([
      {
        id: 10,
        text: 'parent',
        description: 'notes',
        children: [{ id: 11, text: 'child', isDone: false }],
      },
    ]);
    await service.applyOperation(7, op());
    expect(row().todayList[0]).toMatchObject({
      description: 'notes',
      isDone: true,
      children: [{ id: 11, isDone: true }],
    });
  });
  it('rejects the loser of a compare-and-swap race', async () => {
    const { service, tx } = setup();
    tx.todo.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(service.applyOperation(7, op())).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(tx.todoMutation.create).not.toHaveBeenCalled();
  });
  it('does not expose another user receipt', async () => {
    const { service } = setup();
    await service.applyOperation(7, op());
    await expect(service.applyOperation(8, op())).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
