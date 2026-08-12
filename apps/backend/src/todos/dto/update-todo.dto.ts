import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsNumber,
  IsString,
  IsBoolean,
  IsIn,
  IsOptional,
  MaxLength,
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

  @ApiProperty({
    description: '항목 유형',
    enum: ['todo', 'section'],
    example: 'todo',
  })
  @IsString()
  @IsIn(['todo', 'section'])
  type: 'todo' | 'section' | undefined;

  @ApiProperty({ description: '투두 설명', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @ApiProperty({ description: '하위 투두 목록', required: false, type: [TodoItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TodoItemDto)
  children?: TodoItemDto[];
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
