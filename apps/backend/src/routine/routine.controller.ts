import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RoutineService } from './routine.service';

@Controller('routines')
export class RoutineController {
  constructor(private routineService: RoutineService) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  async getRoutines(@Req() req: any) {
    return this.routineService.getRoutines(req.user.sub);
  }
  @UseGuards(JwtAuthGuard)
  @Put()
  async update(@Req() req: any, @Body() body: { name: string; data: any[] }) {
    // 데이터 검증
    if (
      !['dailyRoutines', 'weeklyRoutines', 'monthlyRoutines'].includes(
        body.name,
      )
    ) {
      throw new Error('유효하지 않은 루틴 리스트 이름입니다.');
    }

    if (body.data.some((item: any) => item.text.length > 200)) {
      throw new Error('루틴 항목은 최대 200자까지 입력할 수 있습니다.');
    }

    if (body.data.length > 20) {
      throw new Error('각 리스트는 최대 20개까지 추가할 수 있습니다.');
    }

    const updatedRoutine = await this.routineService.updateRoutine(
      req.user.sub,
      body.name as 'dailyRoutines' | 'weeklyRoutines' | 'monthlyRoutines',
      body.data,
    );
    return updatedRoutine;
  }
}
