import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OverallService } from './overall.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import type { UpdateOverallDto } from './dto/update-overall.dto';

@Controller('overall')
export class OverallController {
  constructor(private overallService: OverallService) {}
  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllOverall(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        '시작 날짜와 종료 날짜를 모두 제공해야 합니다.',
      );
    }
    return this.overallService.getAllOverall(req.user.sub, startDate, endDate);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getOverall(@Req() req: any, @Query('date') date?: string) {
    if (!date) {
      throw new BadRequestException('날짜가 제공되지 않았습니다.');
    }
    return this.overallService.getOverall(req.user.sub, date);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createOverall(@Req() req: any, @Body() dto: UpdateOverallDto) {
    if (dto.memo && dto.memo.length > 500) {
      throw new BadRequestException(
        '메모는 최대 500자까지 입력할 수 있습니다.',
      );
    }
    return this.overallService.createOverall(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateOverall(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() dto: UpdateOverallDto,
  ) {
    if (dto.memo && dto.memo.length > 500) {
      throw new BadRequestException(
        '메모는 최대 500자까지 입력할 수 있습니다.',
      );
    }
    return this.overallService.updateOverall(id, req.user.sub, dto);
  }
}
