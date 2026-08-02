import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from 'src/common/interfaces/request.interface';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { BudgetItem, BudgetService, UpdateBudget } from './budget.service';

const MAX_AMOUNT = 1_000_000_000;

function validateItems(value: unknown, label: string): BudgetItem[] {
  if (!Array.isArray(value) || value.length > 50) {
    throw new BadRequestException(
      `${label}은 최대 50개까지 입력할 수 있습니다.`,
    );
  }

  return value.map((raw) => {
    const item = raw as Partial<BudgetItem>;
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    const amount = Number(item.amount);

    if (!name || name.length > 40) {
      throw new BadRequestException(`${label} 이름은 1~40자로 입력해주세요.`);
    }
    if (!Number.isInteger(amount) || amount < 0 || amount > MAX_AMOUNT) {
      throw new BadRequestException(`${label} 금액을 확인해주세요.`);
    }
    return {
      id:
        typeof item.id === 'string' && item.id.length <= 80
          ? item.id
          : crypto.randomUUID(),
      name,
      amount,
      ...(typeof item.category === 'string' && item.category.trim()
        ? { category: item.category.trim().slice(0, 20) }
        : {}),
    };
  });
}

@UseGuards(JwtAuthGuard)
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  getBudget(@Req() req: AuthenticatedRequest) {
    return this.budgetService.getBudget(req.user.sub);
  }

  @Put()
  updateBudget(
    @Req() req: AuthenticatedRequest,
    @Body() body: Partial<UpdateBudget>,
  ) {
    const salary = Number(body.salary);
    if (!Number.isInteger(salary) || salary < 0 || salary > MAX_AMOUNT) {
      throw new BadRequestException('월급 금액을 확인해주세요.');
    }

    return this.budgetService.updateBudget(req.user.sub, {
      salary,
      fixedIncomes: validateItems(body.fixedIncomes, '고정수입'),
      fixedExpenses: validateItems(body.fixedExpenses, '고정지출'),
    });
  }
}
