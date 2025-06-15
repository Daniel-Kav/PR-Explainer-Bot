import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePrSummaryDto } from './dto/create-pr-summary.dto';
import { PrSummaryResponseDto } from './dto/pr-summary-response.dto';
import { GithubService } from '../github/github.service';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class PrSummaryService {
  constructor(
    private readonly githubService: GithubService,
    private readonly geminiService: GeminiService,
  ) {}

  async create(createPrSummaryDto: CreatePrSummaryDto): Promise<PrSummaryResponseDto> {
    try {
      const [owner, repo] = createPrSummaryDto.repo.split('/');
      
      if (!owner || !repo) {
        throw new HttpException('Invalid repository format. Use owner/repo', HttpStatus.BAD_REQUEST);
      }

      // Get PR diff from GitHub
      const diff = await this.githubService.getPrDiff(owner, repo, createPrSummaryDto.pr_number);

      // Generate summary using Gemini
      const { summary, risk_score } = await this.geminiService.generatePrSummary(diff);

      return {
        summary,
        risk_score,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error in PrSummaryService:', error);
      throw new HttpException(
        'Failed to generate PR summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
