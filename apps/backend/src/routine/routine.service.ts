import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RoutineService {
  constructor(private prisma: PrismaService) {}
  async getRoutines(id: number) {
    const routine = await this.prisma.routine.findUnique({
      where: { userId: id },
    });
    return routine;
  }
  async updateRoutine(
    id: number,
    listName: 'dailyRoutines' | 'weeklyRoutines' | 'monthlyRoutines',
    data: any[],
  ) {
    const existingRoutine = await this.prisma.routine.findUnique({
      where: { userId: id },
    });

    if (!existingRoutine) {
      await this.prisma.routine.create({
        data: {
          userId: id,
          dailyRoutines:
            listName === 'dailyRoutines'
              ? JSON.parse(JSON.stringify(data))
              : [],
          weeklyRoutines:
            listName === 'weeklyRoutines'
              ? JSON.parse(JSON.stringify(data))
              : [],
          monthlyRoutines:
            listName === 'monthlyRoutines'
              ? JSON.parse(JSON.stringify(data))
              : [],
        },
        include: { user: true },
      });
      return;
    }

    await this.prisma.routine.update({
      where: { userId: id },
      data: {
        [listName]: JSON.parse(JSON.stringify(data)),
      },
      include: { user: true },
    });

    return;
  }
}
