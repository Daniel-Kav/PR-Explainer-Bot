import { Test, TestingModule } from '@nestjs/testing';
import { PrSummaryService } from './pr-summary.service';
import { GithubService } from '../github/github.service';
import { GeminiService } from '../gemini/gemini.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('PrSummaryService', () => {
  let service: PrSummaryService;
  let githubService: jest.Mocked<GithubService>;
  let geminiService: jest.Mocked<GeminiService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrSummaryService,
        {
          provide: GithubService,
          useValue: {
            getPrDiff: jest.fn(),
          },
        },
        {
          provide: GeminiService,
          useValue: {
            generatePrSummary: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PrSummaryService>(PrSummaryService);
    githubService = module.get(GithubService) as jest.Mocked<GithubService>;
    geminiService = module.get(GeminiService) as jest.Mocked<GeminiService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockPrDiff = 'diff --git a/file.txt b/file.txt\n+++ b/file.txt';
    const mockSummary = 'This is a test summary';
    const mockRiskScore = 2;

    it('should return PR summary when inputs are valid', async () => {
      githubService.getPrDiff.mockResolvedValue(mockPrDiff);
      geminiService.generatePrSummary.mockResolvedValue({
        summary: mockSummary,
        risk_score: mockRiskScore,
      });

      const result = await service.create({
        repo: 'owner/repo',
        pr_number: 123,
      });

      expect(result).toEqual({
        summary: mockSummary,
        risk_score: mockRiskScore,
      });
      expect(githubService.getPrDiff).toHaveBeenCalledWith('owner', 'repo', 123);
      expect(geminiService.generatePrSummary).toHaveBeenCalledWith(mockPrDiff);
    });

    it('should throw BadRequestException for invalid repo format', async () => {
      await expect(
        service.create({
          repo: 'invalid-repo-format',
          pr_number: 123,
        }),
      ).rejects.toThrow(HttpException);
    });

    it('should handle errors from GitHub service', async () => {
      githubService.getPrDiff.mockRejectedValue(
        new HttpException('PR not found', HttpStatus.NOT_FOUND),
      );

      await expect(
        service.create({
          repo: 'owner/repo',
          pr_number: 123,
        }),
      ).rejects.toThrow(HttpException);
    });

    it('should handle errors from Gemini service', async () => {
      githubService.getPrDiff.mockResolvedValue(mockPrDiff);
      geminiService.generatePrSummary.mockRejectedValue(
        new Error('API error'),
      );

      await expect(
        service.create({
          repo: 'owner/repo',
          pr_number: 123,
        }),
      ).rejects.toThrow(HttpException);
    });
  });
});
