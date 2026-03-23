import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LogService } from './log.service';
import { LogController } from './log.controller';

@Module({
  controllers: [LogController],
  providers: [LogService, PrismaService],
})
export class LogModule {}
