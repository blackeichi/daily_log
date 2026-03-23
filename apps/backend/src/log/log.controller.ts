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
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { LogService } from './log.service';
import type { UpdateLogDto } from './dto/update-log.dto';

@Controller('log')
export class LogController {
  constructor(private logService: LogService) {}
  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllLogs(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('searchTitle') searchTitle?: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        '시작 날짜와 종료 날짜를 모두 제공해야 합니다.',
      );
    }
    return this.logService.getAllLogs(
      req.user.sub,
      startDate,
      endDate,
      searchTitle,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getLog(@Query('id') id?: string) {
    const logId = id ? Number(id) : undefined;
    if (!logId) {
      throw new BadRequestException('로그 ID가 제공되지 않았습니다.');
    }
    return this.logService.getLog(logId);
  }
  @UseGuards(JwtAuthGuard)
  @Post()
  async createLog(@Req() req: any, @Body() dto: UpdateLogDto) {
    if (Object.values(dto.todayLog || {}).some((value) => value.length > 200)) {
      throw new Error('로그 항목은 최대 200자까지 입력할 수 있습니다.');
    }
    return this.logService.createLog(req.user.sub, dto);
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLogDto,
    @Req() req,
  ) {
    if (Object.values(dto.todayLog || {}).some((value) => value.length > 200)) {
      throw new Error('로그 항목은 최대 200자까지 입력할 수 있습니다.');
    }
    const updatedLog = await this.logService.updateLog(id, req.user.sub, dto);
    return updatedLog;
  }
  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteLog(@Req() req: any, @Body() dto: { id: number }) {
    return this.logService.deleteLog(dto.id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('excel')
  async getLogsForExcel(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('searchTitle') searchTitle?: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        '시작 날짜와 종료 날짜를 모두 제공해야 합니다.',
      );
    }
    // 엑셀 다운로드용 - 페이지네이션 없이 모든 데이터 반환
    return this.logService.getAllLogs(
      req.user.sub,
      startDate,
      endDate,
      searchTitle,
      true,
    );
  }
}
