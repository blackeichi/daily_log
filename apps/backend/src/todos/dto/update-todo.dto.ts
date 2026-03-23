import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsNumber,
  IsString,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TodoItemDto {
  @ApiProperty({ description: '할일 ID', example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ description: '할일 내용', example: '운동하기' })
  @IsString()
  text: string;

  @ApiProperty({ description: '완료 여부', example: false })
  @IsBoolean()
  isDone: boolean;
}

export class UpdateTodoDto {
  @ApiProperty({
    description: '업데이트할 리스트 이름',
    enum: ['todayList', 'weekList', 'monthList', 'yearList', 'breakLimitList'],
    example: 'todayList',
  })
  @IsString()
  @IsIn(['todayList', 'weekList', 'monthList', 'yearList', 'breakLimitList'])
  name: 'todayList' | 'weekList' | 'monthList' | 'yearList' | 'breakLimitList';

  @ApiProperty({
    description: '업데이트할 할일 목록',
    type: [TodoItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TodoItemDto)
  data: TodoItemDto[];
}
