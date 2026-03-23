import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsObject, IsDateString } from 'class-validator';

export class UpdateLogDto {
  @ApiProperty({
    description: '오늘의 로그 (키-값 쌍)',
    example: { 아침: '운동했음', 저녁: '책 읽음' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  todayLog?: { [key: string]: string };

  @ApiProperty({
    description: '로그 제목',
    example: '좋은 하루였다',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: '로그 날짜 (YYYY-MM-DD)',
    example: '2025-11-10',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  logDate?: string;
}
