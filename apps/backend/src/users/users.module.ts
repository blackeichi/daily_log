import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma.service';
import { TodosService } from 'src/todos/todos.service';
import { CaloriesService } from 'src/calories/calories.service';
import { LogService } from 'src/log/log.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaService,
    TodosService,
    CaloriesService,
    LogService,
  ],
})
export class UsersModule {}
