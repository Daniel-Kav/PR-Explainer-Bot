import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrSummaryService } from './../src/pr-summary/pr-summary.service';
import { GithubService } from './../src/github/github.service';
import { GeminiService } from './../src/gemini/gemini.service';

describe('PR Summary (e2e)', () => {
  let app: INestApplication;
  let prSummaryService: PrSummaryService;
  let githubService: GithubService;
  let geminiService: GeminiService;

  const mockPrDiff = 'diff --git a/file.txt b/file.txt\n+++ b/file.txt';
  const mockSummary = 'This is a test summary';
  const mockRiskScore = 2;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GithubService)
      .useValue({
        getPrDiff: jest.fn(),
      })
      .overrideProvider(GeminiService)
      .useValue({
        generatePrSummary: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prSummaryService = moduleFixture.get<PrSummaryService>(PrSummaryService);
    githubService = moduleFixture.get<GithubService>(GithubService);
    geminiService = moduleFixture.get<GeminiService>(GeminiService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /pr-summary', () => {
    it('should return PR summary for valid request', async () => {
      // Mock the services
      jest.spyOn(githubService, 'getPrDiff').mockResolvedValue(mockPrDiff);
      jest.spyOn(geminiService, 'generatePrSummary').mockResolvedValue({
        summary: mockSummary,
        risk_score: mockRiskScore,
      });

      const response = await request(app.getHttpServer())
        .post('/pr-summary')
        .send({
          repo: 'owner/repo',
          pr_number: 123,
        })
        .expect(201);

      expect(response.body).toEqual({
        summary: mockSummary,
        risk_score: mockRiskScore,
      });
    });

    it('should return 400 for invalid repo format', async () => {
      const response = await request(app.getHttpServer())
        .post('/pr-summary')
        .send({
          repo: 'invalid-repo-format',
          pr_number: 123,
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid repository format');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/pr-summary')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Validation failed');
    });

    it('should return 404 when PR is not found', async () => {
      jest.spyOn(githubService, 'getPrDiff').mockRejectedValue(
        new Error('PR not found'),
      );

      const response = await request(app.getHttpServer())
        .post('/pr-summary')
        .send({
          repo: 'owner/repo',
          pr_number: 9999,
        })
        .expect(404);

      expect(response.body.message).toContain('PR not found');
    });

    it('should return 500 for Gemini API errors', async () => {
      jest.spyOn(githubService, 'getPrDiff').mockResolvedValue(mockPrDiff);
      jest.spyOn(geminiService, 'generatePrSummary').mockRejectedValue(
        new Error('API error'),
      );

      const response = await request(app.getHttpServer())
        .post('/pr-summary')
        .send({
          repo: 'owner/repo',
          pr_number: 123,
        })
        .expect(500);

      expect(response.body.message).toContain('Failed to generate PR summary');
    });
  });
});
