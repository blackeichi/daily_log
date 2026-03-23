import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsNumber,
  IsString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RoutineItemDto {
  @ApiProperty({ description: '루틴 ID', example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ description: '루틴 내용', example: '아침 운동' })
  @IsString()
  text: string;
}

export class UpdateRoutineDto {
  @ApiProperty({
    description: '업데이트할 루틴 리스트 이름',
    enum: ['dailyRoutines', 'weeklyRoutines', 'monthlyRoutines'],
    example: 'dailyRoutines',
  })
  @IsString()
  @IsIn(['dailyRoutines', 'weeklyRoutines', 'monthlyRoutines'])
  name: 'dailyRoutines' | 'weeklyRoutines' | 'monthlyRoutines';

  @ApiProperty({
    description: '업데이트할 루틴 목록',
    type: [RoutineItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineItemDto)
  data: RoutineItemDto[];
}
