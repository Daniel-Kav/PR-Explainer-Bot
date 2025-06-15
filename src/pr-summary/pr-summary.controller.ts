import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { PrSummaryService } from './pr-summary.service';
import { CreatePrSummaryDto } from './dto/create-pr-summary.dto';
import { PrSummaryResponseDto } from './dto/pr-summary-response.dto';

@Controller('pr-summary')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PrSummaryController {
  constructor(private readonly prSummaryService: PrSummaryService) {}

  @Post()
  async create(
    @Body() createPrSummaryDto: CreatePrSummaryDto,
  ): Promise<PrSummaryResponseDto> {
    try {
      return await this.prSummaryService.create(createPrSummaryDto);
    } catch (error) {
      throw error; // Let the global exception filter handle it
    }
  }
}
