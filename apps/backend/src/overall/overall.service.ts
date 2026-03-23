import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UpdateOverallDto } from './dto/update-overall.dto';

@Injectable()
export class OverallService {
  constructor(private prisma: PrismaService) {}
  async getAllOverall(id: number, startDate: string, endDate: string) {
    return this.prisma.overallReview.findMany({
      where: {
        userId: id,
        reviewDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        reviewDate: true,
        emotion: true,
      },
      orderBy: {
        reviewDate: 'desc',
      },
    });
  }
  async getOverall(userId: number, reviewDate: string) {
    const overall = this.prisma.overallReview.findUnique({
      where: {
        userId_reviewDate: {
          userId,
          reviewDate,
        },
      },
    });
    if (!overall) {
      throw new BadRequestException('해당 기록이 존재하지 않습니다.');
    }
    return overall;
  }

  async createOverall(id: number, dto: UpdateOverallDto) {
    const existing = await this.prisma.overallReview.findFirst({
      where: { userId: id, reviewDate: dto.reviewDate },
    });
    if (existing) {
      throw new BadRequestException('해당 날짜에 이미 기록이 존재합니다.');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: id },
    });
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }
    const newOverall = await this.prisma.overallReview.create({
      data: {
        userId: id,
        memo: dto.memo || '',
        reviewDate: dto.reviewDate,
        emotion: dto.emotion,
        isGetAdvice: dto.isGetAdvice || false,
      },
      include: { user: true },
    });
    return {
      message: '성공적으로 기록이 생성되었습니다.',
      id: newOverall.id,
    };
  }

  async updateOverall(
    overallId: number,
    userId: number,
    dto: UpdateOverallDto,
  ) {
    const existingOverall = await this.prisma.overallReview.findUnique({
      where: { id: overallId },
    });
    if (!existingOverall || existingOverall.userId !== userId) {
      throw new BadRequestException('수정 권한이 없습니다.');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }
    await this.prisma.overallReview.update({
      where: { id: overallId },
      data: {
        memo: dto.memo || '',
        emotion: dto.emotion,
        isGetAdvice: dto.isGetAdvice || false,
      },
      include: { user: true },
    });

    return { message: '성공적으로 기록이 수정되었습니다.' };
  }
}
