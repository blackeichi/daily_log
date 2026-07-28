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

type TodoListName = (typeof TODO_LIST_NAMES)[number];
type TodoListsPayload = Record<TodoListName, any[]>;

@Controller('todos')
export class TodosController {
  constructor(private todosService: TodosService) {}

  private validateTodoList(data: unknown): asserts data is any[] {
    if (!Array.isArray(data)) {
      throw new BadRequestException('유효하지 않은 투두 목록입니다.');
    }

    if (data.some((item: any) => typeof item?.text !== 'string')) {
      throw new BadRequestException('유효하지 않은 투두 항목입니다.');
    }

    if (data.some((item: any) => item.text.length > MAX_TODO_ITEM_LENGTH)) {
      throw new BadRequestException(
        `투두 항목은 최대 ${MAX_TODO_ITEM_LENGTH}자까지 입력할 수 있습니다.`,
      );
    }

    if (data.length > 30) {
      throw new BadRequestException(
        '각 리스트는 최대 30개까지 추가할 수 있습니다.',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTodos(@Req() req: AuthenticatedRequest) {
    return this.todosService.getTodos(req.user.sub);
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
