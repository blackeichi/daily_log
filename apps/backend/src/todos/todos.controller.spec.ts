import type { AuthenticatedRequest } from 'src/common/interfaces/request.interface';
import { TodosController } from './todos.controller';
import type { TodosService } from './todos.service';

describe('TodosController', () => {
  it('accepts a parent todo with both a description and child todos', async () => {
    const payload = {
      todayList: [
        {
          id: 1,
          text: 'parent',
          isDone: false,
          description: 'parent description',
          children: [{ id: 2, text: 'child', isDone: false }],
        },
      ],
      weekList: [],
      monthList: [],
      yearList: [],
      breakLimitList: [],
    };
    const syncTodos = jest.fn().mockResolvedValue(payload);
    const controller = new TodosController({
      syncTodos,
    } as unknown as TodosService);
    const request = {
      user: { sub: 7, email: 'test@example.com' },
    } as AuthenticatedRequest;

    await expect(controller.syncTodos(payload, request)).resolves.toBe(payload);
    expect(syncTodos).toHaveBeenCalledWith(7, payload);
  });
});
