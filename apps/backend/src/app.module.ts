import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { TodosModule } from './todos/todos.module';
import { CaloriesModule } from './calories/calories.module';
import { LogModule } from './log/log.module';
import { RoutineModule } from './routine/routine.module';
import { OverallModule } from './overall/overall.module';
import { CustomLogger } from './common/logger.service';

@Module({
  imports: [
    // 환경변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // Rate limiting 설정
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('THROTTLE_TTL', 60000), // 1분
          limit: configService.get('THROTTLE_LIMIT', 100), // 100 requests
        },
      ],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    TodosModule,
    CaloriesModule,
    LogModule,
    RoutineModule,
    OverallModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, CustomLogger],
  exports: [PrismaService, CustomLogger],
})
export class AppModule {}
