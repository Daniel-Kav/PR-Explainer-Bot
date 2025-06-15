import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { GithubService } from './github.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('GithubService', () => {
  let service: GithubService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        GithubService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<GithubService>(GithubService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPrDiff', () => {
    const mockToken = 'test-token';
    const owner = 'test-owner';
    const repo = 'test-repo';
    const prNumber = 123;
    const mockDiff = 'test-diff';

    beforeEach(() => {
      mockConfigService.get.mockReturnValue(mockToken);
    });

    it('should fetch PR diff successfully', async () => {
      const axiosResponse = {
        data: mockDiff,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      mockHttpService.get.mockImplementation(() => of(axiosResponse as any));

      const result = await service.getPrDiff(owner, repo, prNumber);

      expect(result).toBe(mockDiff);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
        {
          headers: {
            Authorization: `token ${mockToken}`,
            Accept: 'application/vnd.github.v3.diff',
          },
          responseType: 'text',
        },
      );
    });

    it('should handle 404 error when PR is not found', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { message: 'Not Found' },
        },
      };

      mockHttpService.get.mockImplementation(() =>
        throwError(() => errorResponse),
      );

      await expect(service.getPrDiff(owner, repo, prNumber)).rejects.toThrow(
        HttpException,
      );
    });

    it('should handle unauthorized error', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Bad credentials' },
        },
      };

      mockHttpService.get.mockImplementation(() =>
        throwError(() => errorResponse),
      );

      await expect(service.getPrDiff(owner, repo, prNumber)).rejects.toThrow(
        HttpException,
      );
    });

    it('should handle missing GitHub token', async () => {
      mockConfigService.get.mockReturnValue(undefined);

      await expect(service.getPrDiff(owner, repo, prNumber)).rejects.toThrow(
        'GitHub token not configured',
      );
    });
  });
});
