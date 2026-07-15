import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsDateString,
  IsInt,
  Min,
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

  @ApiProperty({
    description: '해당 날짜의 목표 칼로리',
    required: false,
    example: 1800,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  goalCalorie?: number;

  @ApiProperty({
    description: '해당 날짜의 최대 칼로리',
    required: false,
    example: 2400,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maximumCalorie?: number;
}
