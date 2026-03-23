import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class UpdateOverallDto {
  @ApiProperty({
    description: '감정 상태',
    example: '좋음',
  })
  @IsString()
  emotion: string;

  @ApiProperty({
    description: '메모',
    example: '오늘은 정말 좋은 하루였다',
    required: false,
  })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiProperty({
    description: '리뷰 날짜 (YYYY-MM-DD)',
    example: '2025-11-10',
  })
  @IsDateString()
  reviewDate: string;

  @ApiProperty({
    description: '조언 받기 여부',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isGetAdvice?: boolean;
}
