import {
  BadRequestException,
  ConflictException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
const names = [
  'todayList',
  'weekList',
  'monthList',
  'yearList',
  'breakLimitList',
] as const;
type ListName = (typeof names)[number];
type Lists = Record<ListName, any[]>;
export type Operation = {
  operationId: string;
  expectedRevision: number;
  action: 'add' | 'complete' | 'delete';
  itemId: number;
  text?: string;
  isDone?: boolean;
};
const conflict = () =>
  new ConflictException(
    '다른 기기에서 Todo가 변경되었습니다. 기기 목록을 백업한 뒤 서버의 최신 목록을 불러와 주세요.',
  );
function protectLocked(oldItems: any[], newItems: any[]) {
  for (const item of oldItems) {
    const next = newItems.find((candidate) => candidate.id === item.id);
    if (item.isDisabled && !next)
      throw new ForbiddenException(
        '잠긴 항목은 먼저 잠금을 해제해야 삭제할 수 있습니다.',
      );
    protectLocked(item.children ?? [], next?.children ?? []);
  }
}
@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}
  getTodos(userId: number) {
    return this.prisma.todo.findUnique({ where: { userId } });
  }
  getTodoVersion(userId: number) {
    return this.prisma.todo.findUnique({
      where: { userId },
      select: { id: true, updatedAt: true, revision: true },
    });
  }
  createTodos(userId: number) {
    return this.prisma.todo.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }
  private async replace(
    userId: number,
    data: Partial<Lists>,
    expectedRevision: number | undefined,
    todoId?: number,
  ) {
    if (!Number.isInteger(expectedRevision) || expectedRevision! < 0)
      throw conflict();
    // Revision zero is reserved for a genuinely new local list; never overwrite an existing one.
    if (expectedRevision === 0) {
      if (todoId !== undefined) throw conflict();
      try {
        return await this.prisma.todo.create({ data: { userId, ...data } });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        )
          throw conflict();
        throw error;
      }
    }
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.todo.findUnique({ where: { userId } });
      if (
        !current ||
        (todoId !== undefined && current.id !== todoId) ||
        current.revision !== expectedRevision
      )
        throw conflict();
      for (const name of names)
        if (data[name]) protectLocked(current[name] as any[], data[name]!);
      const updatedAt = new Date();
      const result = await tx.todo.updateMany({
        where: { id: current.id, userId, revision: expectedRevision },
        data: { ...data, revision: { increment: 1 }, updatedAt },
      });
      if (result.count !== 1) throw conflict();
      return { ...current, ...data, revision: current.revision + 1, updatedAt };
    });
  }
  updateTodo(
    todoId: number,
    userId: number,
    name: ListName,
    data: any[],
    revision?: number,
  ) {
    return this.replace(userId, { [name]: data }, revision, todoId);
  }
  updateAllTodos(
    todoId: number,
    userId: number,
    data: Lists,
    revision?: number,
  ) {
    return this.replace(userId, data, revision, todoId);
  }
  syncTodos(userId: number, data: Lists, revision?: number) {
    return this.replace(userId, data, revision);
  }
  async applyOperation(userId: number, op: Operation) {
    if (
      !op ||
      typeof op.operationId !== 'string' ||
      !/^[0-9a-f-]{36}$/i.test(op.operationId) ||
      !Number.isSafeInteger(op.itemId) ||
      op.itemId <= 0 ||
      !Number.isInteger(op.expectedRevision) ||
      op.expectedRevision < 1
    )
      throw new BadRequestException('유효하지 않은 변경 요청입니다.');
    if (!['add', 'complete', 'delete'].includes(op.action))
      throw new BadRequestException('지원하지 않는 동작입니다.');
    if (
      op.action === 'add' &&
      (typeof op.text !== 'string' || !op.text.trim() || op.text.length > 1000)
    )
      throw new BadRequestException('할 일은 1~1000자로 입력해 주세요.');
    if (op.action === 'complete' && typeof op.isDone !== 'boolean')
      throw new BadRequestException('완료 상태가 필요합니다.');
    try {
      return await this.prisma.$transaction(async (tx) => {
        const receipt = await tx.todoMutation.findUnique({
          where: { id: op.operationId },
        });
        if (receipt) {
          if (receipt.userId !== userId) throw new ForbiddenException();
          return tx.todo.findUnique({ where: { userId } });
        }
        const current = await tx.todo.findUnique({ where: { userId } });
        if (!current || current.revision !== op.expectedRevision)
          throw conflict();
        let items = current.todayList as any[];
        const item = items.find((entry) => entry.id === op.itemId);
        if (op.action === 'add') {
          if (items.length >= 100 || item)
            throw new BadRequestException(
              '목록이 가득 찼거나 항목 ID가 중복됩니다.',
            );
          items = [
            ...items,
            {
              id: op.itemId,
              text: op.text!.trim(),
              isDone: false,
              type: 'todo',
            },
          ];
        } else {
          if (!item || item.type === 'section') throw conflict();
          if (op.action === 'delete') {
            protectLocked([item], []);
            items = items.filter((entry) => entry.id !== op.itemId);
          } else
            items = items.map((entry) =>
              entry.id === op.itemId
                ? {
                    ...entry,
                    isDone: op.isDone,
                    ...(entry.children
                      ? {
                          children: entry.children.map((child: any) => ({
                            ...child,
                            isDone: op.isDone,
                          })),
                        }
                      : {}),
                  }
                : entry,
            );
        }
        const updatedAt = new Date();
        const result = await tx.todo.updateMany({
          where: { id: current.id, userId, revision: op.expectedRevision },
          data: { todayList: items, revision: { increment: 1 }, updatedAt },
        });
        if (result.count !== 1) throw conflict();
        await tx.todoMutation.create({ data: { id: op.operationId, userId } });
        return {
          ...current,
          todayList: items,
          revision: current.revision + 1,
          updatedAt,
        };
      });
    } catch (error) {
      // A concurrent duplicate can observe the receipt only after the first transaction commits.
      if (
        error instanceof ConflictException ||
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002')
      ) {
        const receipt = await this.prisma.todoMutation.findUnique({
          where: { id: op.operationId },
        });
        if (receipt?.userId === userId) return this.getTodos(userId);
      }
      throw error;
    }
  }
}
