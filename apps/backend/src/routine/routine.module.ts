import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RoutineController } from './routine.controller';
import { RoutineService } from './routine.service';

@Module({
  controllers: [RoutineController],
  providers: [RoutineService, PrismaService],
})
export class RoutineModule {}
