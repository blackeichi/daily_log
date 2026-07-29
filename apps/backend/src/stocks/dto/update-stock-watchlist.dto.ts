import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateStockWatchlistDto {
  @IsArray()
  @ArrayMaxSize(30)
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(/^\d{6}$/, {
    each: true,
    message: '종목 코드는 6자리 숫자여야 합니다.',
  })
  symbols: string[];
}
