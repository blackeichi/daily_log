import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UpdateCaloriesDto } from './dto/update-calories.dto';

@Injectable()
export class CaloriesService {
  constructor(private prisma: PrismaService) {}
  async getAllCalories(id: number, startDate: string, endDate: string) {
    return this.prisma.calorie.findMany({
      where: {
        userId: id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        memo: true,
        totalCalorie: true,
        date: true,
        isSuccess: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
  async getCalorie(userId: number, date: string) {
    const calorie = this.prisma.calorie.findFirst({
      where: { userId, date },
    });
    if (!calorie) {
      throw new BadRequestException('해당 칼로리 기록이 존재하지 않습니다.');
    }
    return calorie;
  }
  async createCalorie(id: number, dto: UpdateCaloriesDto) {
    const existingCalorie = await this.prisma.calorie.findFirst({
      where: { userId: id, date: dto.date },
    });
    if (existingCalorie) {
      throw new BadRequestException(
        '해당 날짜에 이미 칼로리 기록이 존재합니다.',
      );
    }
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      select: { maximumCalorie: true },
    });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    const totalCalorie = dto.totalCalorie || 0;
    const data = await this.prisma.calorie.create({
      data: {
        userId: id,
        memo: dto.memo || '',
        totalCalorie: totalCalorie,
        date: dto.date || new Date().toISOString().split('T')[0],
        isSuccess: totalCalorie <= user.maximumCalorie ? true : false,
        eatenList: dto.eatenList
          ? JSON.parse(JSON.stringify(dto.eatenList))
          : [],
      },
      include: { user: true },
    });
    return { message: '성공적으로 칼로리 기록이 생성되었습니다.', data };
  }
  async updateCalorie(
    calorieId: number,
    userId: number,
    dto: UpdateCaloriesDto,
  ) {
    const existingCalorie = await this.prisma.calorie.findUnique({
      where: { id: calorieId },
    });
    if (!existingCalorie || existingCalorie.userId !== userId) {
      throw new BadRequestException('수정 권한이 없습니다.');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { maximumCalorie: true },
    });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    const totalCalorie = dto.totalCalorie || 0;
    const data = await this.prisma.calorie.update({
      where: { id: calorieId },
      data: {
        memo: dto.memo || '',
        totalCalorie: totalCalorie,
        date: dto.date || existingCalorie.date,
        isSuccess: totalCalorie <= user.maximumCalorie ? true : false,
        eatenList: dto.eatenList
          ? JSON.parse(JSON.stringify(dto.eatenList))
          : [],
      },
      include: { user: true },
    });

    return { message: '성공적으로 칼로리 기록이 수정되었습니다.', data };
  }
  async deleteCalorie(calorieId: number, userId: number) {
    // 먼저 해당 칼로리 기록이 존재하는지 확인
    const calorie = await this.prisma.calorie.findUnique({
      where: { id: calorieId },
    });
    if (!calorie) {
      throw new NotFoundException('로그를 찾을 수 없습니다.');
    }

    // 칼로리 기록 소유자 확인
    if (calorie.userId !== userId) {
      throw new BadRequestException('삭제 권한이 없습니다.');
    }

    await this.prisma.calorie.delete({ where: { id: calorieId } });
    return { message: '성공적으로 칼로리 기록이 삭제되었습니다.' };
  }
}
