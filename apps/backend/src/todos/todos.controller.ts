import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { TodosService } from './todos.service';
import type { AuthenticatedRequest } from 'src/common/interfaces/request.interface';

const TODO_LIST_NAMES = [
  'todayList',
  'weekList',
  'monthList',
  'yearList',
  'breakLimitList',
] as const;
const MAX_TODO_ITEM_LENGTH = 1000;
const MAX_TODO_DESCRIPTION_LENGTH = 10000;
const MAX_TODO_ITEMS = 100;
const MAX_SUB_TODO_ITEMS = 50;

type TodoListName = (typeof TODO_LIST_NAMES)[number];
type TodoListsPayload = Record<TodoListName, any[]>;

@Controller('todos')
export class TodosController {
  constructor(private todosService: TodosService) {}

  private validateTodoList(data: unknown): asserts data is any[] {
    if (!Array.isArray(data)) {
      throw new BadRequestException('유효하지 않은 투두 목록입니다.');
    }

    if (
      data.some(
        (item: unknown) =>
          typeof item !== 'object' ||
          item === null ||
          !('text' in item) ||
          typeof item.text !== 'string',
      )
    ) {
      throw new BadRequestException('유효하지 않은 투두 항목입니다.');
    }

    if (
      data.some(
        (item: unknown) =>
          typeof item === 'object' &&
          item !== null &&
          'text' in item &&
          typeof item.text === 'string' &&
          item.text.length > MAX_TODO_ITEM_LENGTH,
      )
    ) {
      throw new BadRequestException(
        `투두 항목은 최대 ${MAX_TODO_ITEM_LENGTH}자까지 입력할 수 있습니다.`,
      );
    }

    for (const item of data) {
      if (typeof item !== 'object' || item === null) continue;

      if (
        'description' in item &&
        item.description !== undefined &&
        (typeof item.description !== 'string' ||
          item.description.length > MAX_TODO_DESCRIPTION_LENGTH)
      ) {
        throw new BadRequestException(
          `투두 설명은 최대 ${MAX_TODO_DESCRIPTION_LENGTH}자까지 입력할 수 있습니다.`,
        );
      }

      if ('children' in item && item.children !== undefined) {
        if (!Array.isArray(item.children)) {
          throw new BadRequestException('하위 투두 목록이 올바르지 않습니다.');
        }
        if (item.children.length > MAX_SUB_TODO_ITEMS) {
          throw new BadRequestException(
            `하위 투두는 최대 ${MAX_SUB_TODO_ITEMS}개까지 추가할 수 있습니다.`,
          );
        }
        if (
          item.children.length > 0 &&
          'description' in item &&
          typeof item.description === 'string' &&
          item.description.trim().length > 0
        ) {
          throw new BadRequestException(
            '하위 투두가 있는 상위 투두에는 설명을 입력할 수 없습니다.',
          );
        }
        if (
          item.children.some(
            (child: unknown) =>
              typeof child !== 'object' ||
              child === null ||
              !('text' in child) ||
              typeof child.text !== 'string' ||
              child.text.length > MAX_TODO_ITEM_LENGTH ||
              ('description' in child &&
                child.description !== undefined &&
                (typeof child.description !== 'string' ||
                  child.description.length > MAX_TODO_DESCRIPTION_LENGTH)),
          )
        ) {
          throw new BadRequestException('하위 투두 내용이 올바르지 않습니다.');
        }
      }
    }

    if (data.length > MAX_TODO_ITEMS) {
      throw new BadRequestException(
        `각 목록에는 최대 ${MAX_TODO_ITEMS}개까지 추가할 수 있습니다.`,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTodos(@Req() req: AuthenticatedRequest) {
    return this.todosService.getTodos(req.user.sub);
  }
  @UseGuards(JwtAuthGuard)
  @Get('version')
  async getTodoVersion(@Req() req: AuthenticatedRequest) {
    return this.todosService.getTodoVersion(req.user.sub);
  }
  @UseGuards(JwtAuthGuard)
  @Put('sync')
  async syncTodos(
    @Body() body: Partial<TodoListsPayload>,
    @Req() req: AuthenticatedRequest,
  ) {
    TODO_LIST_NAMES.forEach((listName) => {
      this.validateTodoList(body[listName]);
    });

    return this.todosService.syncTodos(req.user.sub, body as TodoListsPayload);
  }
  @UseGuards(JwtAuthGuard)
  @Post()
  async createTodos(@Req() req: AuthenticatedRequest) {
    const existingTodo = await this.todosService.getTodos(req.user.sub);
    if (existingTodo) {
      throw new Error('이미 투두 리스트가 존재합니다. 새로고침해주세요.');
    }
    return this.todosService.createTodos(req.user.sub);
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id/all')
  async updateAll(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<TodoListsPayload>,
    @Req() req: AuthenticatedRequest,
  ) {
    TODO_LIST_NAMES.forEach((listName) => {
      this.validateTodoList(body[listName]);
    });

    return this.todosService.updateAllTodos(
      id,
      req.user.sub,
      body as TodoListsPayload,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name: string; data: any[] },
    @Req() req: AuthenticatedRequest,
  ) {
    // 데이터 검증
    if (!TODO_LIST_NAMES.includes(body.name as TodoListName)) {
      throw new BadRequestException('유효하지 않은 투두 리스트 이름입니다.');
    }

    this.validateTodoList(body.data);

    const updatedTodo = await this.todosService.updateTodo(
      id,
      req.user.sub,
      body.name as TodoListName,
      body.data,
    );
    return updatedTodo;
  }
}
