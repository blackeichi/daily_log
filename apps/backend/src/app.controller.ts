import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '기본 인사말' })
  @ApiResponse({
    status: 200,
    description: '성공적으로 인사말을 반환합니다.',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: '헬스 체크' })
  @ApiResponse({
    status: 200,
    description: '서버 상태를 확인합니다.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 123.456 },
        database: { type: 'string', example: 'connected' },
      },
    },
  })
  async getHealth() {
    return this.appService.getHealth();
  }
}
