import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CaloriesService } from './calories.service';
import { CaloriesController } from './calories.controller';

@Module({
  controllers: [CaloriesController],
  providers: [CaloriesService, PrismaService],
})
export class CaloriesModule {}
