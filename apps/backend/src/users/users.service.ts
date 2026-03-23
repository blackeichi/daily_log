import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async getAiCount(userId: number) {
    const useAiCount = await this.prisma.useAiCount.findUnique({
      where: { userId: userId },
    });
    if (!useAiCount) {
      const today = new Date().toISOString().split('T')[0];
      return this.prisma.useAiCount.create({
        data: {
          userId: userId,
          count: 0,
          date: today,
        },
      });
    }
    return useAiCount;
  }
  async updateAiCount(
    userId: number,
    existing: { userId: number; count: number; date: string },
  ) {
    const today = new Date().toISOString().split('T')[0];
    if (today !== existing.date) {
      return this.prisma.useAiCount.update({
        where: { userId },
        data: {
          count: 1,
          date: today,
        },
      });
    }
    if (1 + existing.count > 10) {
      throw new BadRequestException('AI 사용량이 초과되었습니다.');
    }
    return this.prisma.useAiCount.update({
      where: { userId },
      data: {
        count: 1 + existing.count,
        date: today,
      },
    });
  }
  async findAll() {
    return this.prisma.user.findMany();
  }
  async createUser(data: { email: string; name: string; password: string }) {
    return this.prisma.user.create({
      data: {
        ...data,
        goalCalorie: 2000,
        maximumCalorie: 2500,
        defaultLogObj: [
          '시간을 현명하게 썼나요?',
          '가족, 친구들과 함께할 때 온전히 집중했나요?',
          '오늘 친절했나요?',
          '시끄럽고 바쁜 일상속에서 고요함을 연습했나요?',
          '잘한 일',
          '아쉬운 일',
          '미래의 다짐',
          '배운 점',
        ],
      },
    });
  }
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
  async updateUser(
    id: number,
    data: Partial<{
      refreshToken?: string;
      goalCalorie?: number;
      maximumCalorie?: number;
      defaultLogObj?: string[];
      password?: string;
    }>,
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
