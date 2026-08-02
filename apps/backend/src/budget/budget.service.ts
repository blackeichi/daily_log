import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

export type BudgetItem = {
  id: string;
  name: string;
  amount: number;
  category?: string;
};

export type UpdateBudget = {
  salary: number;
  fixedIncomes: BudgetItem[];
  fixedExpenses: BudgetItem[];
};

@Injectable()
export class BudgetService {
  constructor(private readonly prisma: PrismaService) {}

  async getBudget(userId: number) {
    const budget = await this.prisma.budget.findUnique({ where: { userId } });

    return (
      budget ?? {
        id: 0,
        userId,
        salary: 0,
        fixedIncomes: [],
        fixedExpenses: [],
        createdAt: null,
        updatedAt: null,
      }
    );
  }

  updateBudget(userId: number, data: UpdateBudget) {
    return this.prisma.budget.upsert({
      where: { userId },
      create: {
        userId,
        salary: data.salary,
        fixedIncomes: data.fixedIncomes as unknown as Prisma.InputJsonValue,
        fixedExpenses: data.fixedExpenses as unknown as Prisma.InputJsonValue,
      },
      update: {
        salary: data.salary,
        fixedIncomes: data.fixedIncomes as unknown as Prisma.InputJsonValue,
        fixedExpenses: data.fixedExpenses as unknown as Prisma.InputJsonValue,
      },
    });
  }
}
