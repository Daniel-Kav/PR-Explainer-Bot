import { Controller, Post, Body, HttpStatus, HttpException, UsePipes } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common/pipes';
import { PrSummaryService } from './pr-summary.service';
import { CreatePrSummaryDto } from './dto/create-pr-summary.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBadRequestResponse, 
  ApiNotFoundResponse, 
  ApiInternalServerErrorResponse,
  ApiCreatedResponse
} from '@nestjs/swagger';
import { PrSummaryResponseDto } from './dto/pr-summary-response.dto';

@ApiTags('PR Summary')
@Controller('pr-summary')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PrSummaryController {
  constructor(private readonly prSummaryService: PrSummaryService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Analyze a GitHub pull request',
    description: 'Fetches a PR diff from GitHub and generates a summary with risk assessment using AI.'
  })
  @ApiBody({ 
    type: CreatePrSummaryDto,
    description: 'GitHub repository and PR number to analyze' 
  })
  @ApiCreatedResponse({ 
    description: 'Successfully analyzed PR', 
    type: PrSummaryResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input format (e.g., invalid repo format, missing fields)' 
  })
  @ApiNotFoundResponse({ 
    description: 'GitHub PR not found or not accessible with the provided token' 
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error or AI service unavailable' 
  })
  async create(
    @Body() createPrSummaryDto: CreatePrSummaryDto,
  ): Promise<PrSummaryResponseDto> {
    try {
      return await this.prSummaryService.create(createPrSummaryDto);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        {
          statusCode: status,
          message: error.message || 'Internal server error',
          error: error.name || 'Internal Server Error',
        },
        status,
      );
    }
  }
}
