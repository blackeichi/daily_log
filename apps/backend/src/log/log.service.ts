import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UpdateLogDto } from './dto/update-log.dto';

@Injectable()
export class LogService {
  constructor(private prisma: PrismaService) {}
  async getAllLogs(
    id: number,
    startDate: string,
    endDate: string,
    searchTitle?: string,
    isExcel: boolean = false,
  ) {
    const whereCondition = {
      userId: id,
      logDate: {
        gte: startDate,
        lte: endDate,
      },
      ...(searchTitle &&
        searchTitle.trim() && {
          title: {
            contains: searchTitle.trim(),
            mode: 'insensitive' as const, // 대소문자 구분 없이 검색
          },
        }),
    };

    return this.prisma.log.findMany({
      where: whereCondition,
      select: isExcel ? undefined : { id: true, title: true, logDate: true },
      orderBy: {
        logDate: 'desc',
      },
      take: 1000,
    });
  }
  async getLog(id: number) {
    const log = await this.prisma.log.findUnique({
      where: { id: id },
    });
    if (!log) {
      throw new BadRequestException('해당 로그가 존재하지 않습니다.');
    }
    return log;
  }
  async getLogByDate(userId: number, logDate: string) {
    if (!logDate || !userId) {
      throw new BadRequestException('잘못된 요청입니다.');
    }
    const log = this.prisma.log.findUnique({
      where: {
        userId_logDate: {
          // 이 이름은 Prisma가 자동 생성한 복합 unique 필드 이름
          userId,
          logDate,
        },
      },
    });
    return log;
  }
  async createLog(id: number, dto: UpdateLogDto) {
    const existingLog = await this.prisma.log.findFirst({
      where: { userId: id, logDate: dto.logDate },
    });
    if (existingLog) {
      throw new BadRequestException('해당 날짜에 이미 로그가 존재합니다.');
    }
    await this.prisma.log.create({
      data: {
        userId: id,
        title: dto.title || '',
        todayLog: dto.todayLog || {},
        logDate: dto.logDate || new Date().toISOString().split('T')[0],
      },
      include: { user: true },
    });
    return { message: '성공적으로 로그가 생성되었습니다.' };
  }
  async updateLog(logId: number, userId: number, dto: UpdateLogDto) {
    const existingLog = await this.prisma.log.findUnique({
      where: { id: logId },
    });
    if (!existingLog || existingLog.userId !== userId) {
      throw new BadRequestException('수정 권한이 없습니다.');
    }
    await this.prisma.log.update({
      where: { id: logId },
      data: {
        title: dto.title || '',
        todayLog: dto.todayLog || {},
        logDate: dto.logDate || existingLog.logDate,
      },
      include: { user: true },
    });

    return { message: '성공적으로 로그가 수정되었습니다.' };
  }
  async deleteLog(logId: number, userId: number) {
    // 먼저 해당 로그가 존재하는지 확인
    const log = await this.prisma.log.findUnique({ where: { id: logId } });
    if (!log) {
      throw new NotFoundException('로그를 찾을 수 없습니다.');
    }

    // 로그 소유자 확인
    if (log.userId !== userId) {
      throw new BadRequestException('삭제 권한이 없습니다.');
    }

    await this.prisma.log.delete({ where: { id: logId } });
    return { message: '성공적으로 로그가 삭제되었습니다.' };
  }
}
