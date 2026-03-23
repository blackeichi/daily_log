import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { OverallController } from './overall.controller';
import { OverallService } from './overall.service';

@Module({
  controllers: [OverallController],
  providers: [OverallService, PrismaService],
})
export class OverallModule {}
