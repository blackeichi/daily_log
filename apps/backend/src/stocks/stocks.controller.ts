import {
  Body,
  Controller,
  Get,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from 'src/common/interfaces/request.interface';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { UpdateStockWatchlistDto } from './dto/update-stock-watchlist.dto';
import { StocksService } from './stocks.service';

@UseGuards(JwtAuthGuard)
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  getWatchlist(
    @Req() req: AuthenticatedRequest,
    @Query('refresh') refresh?: string,
  ) {
    return this.stocksService.getWatchlist(req.user.sub, refresh === 'true');
  }

  @Get('search')
  search(@Query('q') query = '') {
    return this.stocksService.search(query);
  }

  @Put()
  updateWatchlist(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateStockWatchlistDto,
  ) {
    return this.stocksService.updateWatchlist(req.user.sub, dto);
  }
}
