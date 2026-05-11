import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class UsersService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getTodayAiHistory(userId: number) {
    const today = new Date().toISOString().split('T')[0];
    return this.prisma.aiHistory.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });
  }

  async createAiHistory(userId: number, content: string) {
    const today = new Date().toISOString().split('T')[0];
    return this.prisma.aiHistory.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        content,
      },
      create: {
        userId,
        content,
        date: today,
      },
    });
  }

  async generateAiConversation(userId: number): Promise<string> {
    const user = await this.findById(userId);
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    // 일주일치 로그 가져오기
    const logs = await this.prisma.log.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 최근 7일간
          lte: new Date(), // 오늘까지
        },
      },
    });
    const defaultMessage =
      '오늘도 충분히 잘하고 있어요! \n 천천히 가도 괜찮아요. 😉';
    // AI에게 전달할 메시지 구성
    let userMessage = `사용자 이름: ${user.name}\n`;

    if (logs.length > 0) {
      userMessage += `최근 ${logs.length}일간의 활동 기록:\n`;
      logs.forEach((log) => {
        userMessage += `\n[${log.logDate}]${log.score ? ` (점수: ${log.score}점)` : ''}\n`;
        if (log.title) {
          userMessage += `제목: ${log.title}\n`;
        }
        if (log.todayLog) {
          userMessage += `내용: ${JSON.stringify(log.todayLog)}\n`;
        }
      });
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              '너는 사용자의 일기를 바탕으로 도움되거나 응원을 하는 한 마디를 해주는 조언자야. 최대한 짧고 강렬하게 현실적으로 도움이 되는 조언을 해줘. 줄바꿈도 넣어주고',
          },
          { role: 'user', content: userMessage },
        ],
      });

      return completion.choices[0]?.message.content ?? defaultMessage;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return defaultMessage;
    }
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
