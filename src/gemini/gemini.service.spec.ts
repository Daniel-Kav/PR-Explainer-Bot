import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiService } from './gemini.service';

// Mock the GoogleGenerativeAI class
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn(),
      }),
    })),
  };
});

describe('GeminiService', () => {
  let service: GeminiService;
  let configService: ConfigService;
  let mockGenerateContent: jest.Mock;

  beforeEach(async () => {
    mockGenerateContent = jest.fn();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
    configService = module.get<ConfigService>(ConfigService);
    
    // Setup the mock implementation for generateContent
    const mockModel = {
      generateContent: mockGenerateContent,
    };
    
    // @ts-ignore - Mock the private method
    jest.spyOn(service, 'getModel').mockReturnValue(mockModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePrSummary', () => {
    const mockPrDiff = 'diff --git a/file.txt b/file.txt\n+++ b/file.txt';
    const mockSummary = 'This is a test summary';
    const mockRiskScore = 2;

    it('should generate PR summary successfully', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            summary: mockSummary,
            risk_score: mockRiskScore,
          }),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await service.generatePrSummary(mockPrDiff);

      expect(result).toEqual({
        summary: mockSummary,
        risk_score: mockRiskScore,
      });
    });

    it('should handle JSON response wrapped in code blocks', async () => {
      const mockResponse = {
        response: {
          text: () => `\`\`\`json\n${JSON.stringify({
            summary: mockSummary,
            risk_score: mockRiskScore,
          })}\n\`\`\``,
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await service.generatePrSummary(mockPrDiff);
      expect(result.summary).toBe(mockSummary);
      expect(result.risk_score).toBe(mockRiskScore);
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        response: {
          text: () => 'invalid-json',
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      await expect(service.generatePrSummary(mockPrDiff)).rejects.toThrow(
        'Failed to parse Gemini response as JSON',
      );
    });

    it('should handle missing required fields in response', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            // Missing required fields
          }),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      await expect(service.generatePrSummary(mockPrDiff)).rejects.toThrow(
        'Invalid response format from Gemini',
      );
    });

    it('should clamp risk score between 1 and 5', async () => {
      const testCases = [
        { input: 0, expected: 1 },
        { input: 1, expected: 1 },
        { input: 3, expected: 3 },
        { input: 5, expected: 5 },
        { input: 10, expected: 5 },
        { input: -5, expected: 1 },
      ];

      for (const { input, expected } of testCases) {
        const mockResponse = {
          response: {
            text: () => JSON.stringify({
              summary: mockSummary,
              risk_score: input,
            }),
          },
        };

        mockGenerateContent.mockResolvedValue(mockResponse);
        const result = await service.generatePrSummary(mockPrDiff);
        expect(result.risk_score).toBe(expected);
      }
    });

    it('should handle API errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API error'));

      await expect(service.generatePrSummary(mockPrDiff)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw an error if GEMINI_API_KEY is not configured', async () => {
      // Mock config to return undefined for the API key
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      // Re-initialize the service to pick up the new config
      const newService = new GeminiService(configService);
      
      await expect(newService.generatePrSummary(mockPrDiff)).rejects.toThrow(
        'GEMINI_API_KEY is not configured',
      );
    });
  });
});
