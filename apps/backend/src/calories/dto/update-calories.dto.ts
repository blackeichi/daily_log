import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EatenItemDto {
  @ApiProperty({
    description: '음식 이름',
    example: '밥',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '칼로리',
    example: 450,
  })
  @IsNumber()
  cal: number;
}

export class UpdateCaloriesDto {
  @ApiProperty({
    description: '먹은 음식 목록',
    type: [EatenItemDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EatenItemDto)
  eatenList?: EatenItemDto[];

  @ApiProperty({
    description: '메모',
    required: false,
    example: '오늘은 건강하게 먹었다',
  })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiProperty({
    description: '날짜 (YYYY-MM-DD)',
    required: false,
    example: '2025-11-10',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    description: '총 칼로리',
    required: false,
    example: 1200,
  })
  @IsOptional()
  @IsNumber()
  totalCalorie?: number;
}
