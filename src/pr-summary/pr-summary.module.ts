import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PrSummaryService } from './pr-summary.service';
import { PrSummaryController } from './pr-summary.controller';
import { GithubModule } from '../github/github.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot(),
    GithubModule,
    GeminiModule,
  ],
  controllers: [PrSummaryController],
  providers: [PrSummaryService],
  exports: [PrSummaryService],
})
export class PrSummaryModule {}
