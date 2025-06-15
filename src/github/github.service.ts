import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GithubService {
  private readonly githubApiUrl = 'https://api.github.com';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getPrDiff(owner: string, repo: string, prNumber: number): Promise<string> {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    
    if (!token) {
      throw new HttpException(
        'GitHub token not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const url = `${this.githubApiUrl}/repos/${owner}/${repo}/pulls/${prNumber}`;
    const headers = {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3.diff',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { headers, responseType: 'text' }),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new HttpException('PR not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to fetch PR diff',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
