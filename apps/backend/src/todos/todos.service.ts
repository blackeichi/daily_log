import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

type TodoListsPayload = {
  todayList: any[];
  weekList: any[];
  monthList: any[];
  yearList: any[];
  breakLimitList: any[];
};

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}
  async getTodos(id: number) {
    return this.prisma.todo.findFirst({ where: { userId: id } });
  }
  async getTodoVersion(id: number) {
    return this.prisma.todo.findUnique({
      where: { userId: id },
      select: { id: true, updatedAt: true },
    });
  }
  async createTodos(id: number) {
    return this.prisma.todo.create({
      data: {
        userId: id,
        todayList: [],
        weekList: [],
        monthList: [],
        yearList: [],
        breakLimitList: [],
      },
      include: { user: true },
    });
  }
  async updateTodo(
    todoId: number,
    id: number,
    listName:
      | 'todayList'
      | 'weekList'
      | 'monthList'
      | 'yearList'
      | 'breakLimitList',
    data: any[],
  ) {
    const existingTodo = await this.prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!existingTodo || existingTodo.userId !== id) {
      throw new BadRequestException(
        '비정상적인 접근입니다. 업데이트할 수 없습니다.',
      );
    }
    const updatedTodo = await this.prisma.todo.update({
      where: { id: todoId },
      data: {
        [listName]: data,
      },
      include: { user: true },
    });
    return updatedTodo;
  }

  async updateAllTodos(todoId: number, id: number, data: TodoListsPayload) {
    const existingTodo = await this.prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!existingTodo || existingTodo.userId !== id) {
      throw new BadRequestException(
        '비정상적인 접근입니다. 업데이트할 수 없습니다.',
      );
    }

    return this.prisma.todo.update({
      where: { id: todoId },
      data,
      include: { user: true },
    });
  }

  async syncTodos(id: number, data: TodoListsPayload) {
    return this.prisma.todo.upsert({
      where: { userId: id },
      create: { userId: id, ...data },
      update: data,
    });
  }
}
