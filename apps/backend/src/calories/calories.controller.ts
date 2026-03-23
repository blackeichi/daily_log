import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CaloriesService } from './calories.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import type { UpdateCaloriesDto } from './dto/update-calories.dto';

@Controller('calories')
export class CaloriesController {
  constructor(private caloriesService: CaloriesService) {}
  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllCalories(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        '시작 날짜와 종료 날짜를 모두 제공해야 합니다.',
      );
    }
    return this.caloriesService.getAllCalories(
      req.user.sub,
      startDate,
      endDate,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCalorie(@Req() req: any, @Query('date') date?: string) {
    if (!date) {
      throw new BadRequestException('날짜가 제공되지 않았습니다.');
    }
    return this.caloriesService.getCalorie(req.user.sub, date);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createCalorie(@Req() req: any, @Body() dto: UpdateCaloriesDto) {
    if (
      dto.eatenList?.some(
        (item) =>
          item.name.length > 100 ||
          (item.cal && item.cal.toString().length > 10),
      )
    ) {
      throw new BadRequestException(
        '음식 이름은 최대 100자, 칼로리는 최대 10자리 숫자까지 입력할 수 있습니다.',
      );
    }
    const totalCalorie = (dto.eatenList || [])
      ?.map((item) => (item?.cal ? Number(item.cal) : 0))
      .reduce((acc, value) => acc + value, 0);
    return this.caloriesService.createCalorie(req.user.sub, {
      ...dto,
      totalCalorie,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateCalorie(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() dto: UpdateCaloriesDto,
  ) {
    if (
      dto.eatenList?.some(
        (item) =>
          item.name.length > 100 ||
          (item.cal && item.cal.toString().length > 10),
      )
    ) {
      throw new BadRequestException(
        '음식 이름은 최대 100자, 칼로리는 최대 10자리 숫자까지 입력할 수 있습니다.',
      );
    }
    const totalCalorie = (dto.eatenList || [])
      ?.map((item) => (item?.cal ? Number(item.cal) : 0))
      .reduce((acc, value) => acc + value, 0);
    return this.caloriesService.updateCalorie(id, req.user.sub, {
      ...dto,
      totalCalorie,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteCalorie(@Req() req: any, @Body() dto: { id: number }) {
    return this.caloriesService.deleteCalorie(dto.id, req.user.sub);
  }
}
