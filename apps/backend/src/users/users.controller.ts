import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { TodosService } from 'src/todos/todos.service';
import { CaloriesService } from 'src/calories/calories.service';
import { LogService } from 'src/log/log.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private todosService: TodosService,
    private caloriesService: CaloriesService,
    private logService: LogService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user) throw new BadRequestException('사용자가 존재하지 않습니다.');
    const { email, name, defaultLogObj, goalCalorie, maximumCalorie } = user;
    return { email, name, defaultLogObj, goalCalorie, maximumCalorie };
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMe(
    @Req() req: any,
    @Body()
    dto: {
      goalCalorie?: number;
      maximumCalorie?: number;
      defaultLogObj?: string[];
    },
  ) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user) throw new BadRequestException('사용자가 존재하지 않습니다.');
    if (
      (dto.goalCalorie && typeof dto.goalCalorie !== 'number') ||
      (dto.maximumCalorie && typeof dto.maximumCalorie !== 'number') ||
      (dto.defaultLogObj && !Array.isArray(dto.defaultLogObj))
    ) {
      throw new BadRequestException('잘못된 요청입니다.');
    }
    const { email, name, defaultLogObj, goalCalorie, maximumCalorie } =
      await this.usersService.updateUser(req.user.sub, dto);
    return {
      message: '사용자 정보가 업데이트 되었습니다.',
      data: { email, name, defaultLogObj, goalCalorie, maximumCalorie },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('all-data/:date')
  async getAllData(@Req() req: any, @Param('date') date: string) {
    if (!date) {
      throw new BadRequestException('잘못된 요청입니다.');
    }
    const user = await this.usersService.findById(req.user.sub);
    if (!user) throw new BadRequestException('사용자가 존재하지 않습니다.');
    /* const todos = await this.todosService.getTodos(req.user.sub);
    const calorie = await this.caloriesService.getCalorie(req.user.sub, date); */
    const log = await this.logService.getLogByDate(req.user.sub, date);
    return {
      /* todos: todos?.todayList || null,
      calorie: calorie || null, */
      log: log?.todayLog || null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('ai-conversation')
  async getAiConversation(@Req() req: any) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user) throw new BadRequestException('사용자가 존재하지 않습니다.');

    // 오늘 날짜의 AI history가 있는지 확인
    const todayAiHistory = await this.usersService.getTodayAiHistory(
      req.user.sub,
    );

    if (todayAiHistory) {
      // 이미 오늘의 AI 대화가 있으면 반환
      return todayAiHistory.content;
    }

    // 오늘의 AI 대화가 없으면 생성
    const aiContent = await this.usersService.generateAiConversation(
      req.user.sub,
    );
    const newAiHistory = await this.usersService.createAiHistory(
      req.user.sub,
      aiContent,
    );

    return newAiHistory.content;
  }
}
