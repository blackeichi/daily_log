import {
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
import { UpdateTodoDto } from './dto/update-todo.dto';
import type { AuthenticatedRequest } from 'src/common/interfaces/request.interface';

@Controller('todos')
export class TodosController {
  constructor(private todosService: TodosService) {}
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
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name: string; data: any[] },
    @Req() req: AuthenticatedRequest,
  ) {
    // 데이터 검증
    if (
      ![
        'todayList',
        'weekList',
        'monthList',
        'yearList',
        'breakLimitList',
      ].includes(body.name)
    ) {
      throw new Error('유효하지 않은 투두 리스트 이름입니다.');
    }

    if (body.data.some((item: any) => item.text.length > 200)) {
      throw new Error('투두 항목은 최대 200자까지 입력할 수 있습니다.');
    }

    if (body.data.length > 20) {
      throw new Error('각 리스트는 최대 20개까지 추가할 수 있습니다.');
    }

    const updatedTodo = await this.todosService.updateTodo(
      id,
      req.user.sub,
      body.name as
        | 'todayList'
        | 'weekList'
        | 'monthList'
        | 'yearList'
        | 'breakLimitList',
      body.data,
    );
    return updatedTodo;
  }
}
