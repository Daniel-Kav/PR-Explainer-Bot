import { Module } from '@nestjs/common';
import { PrSummaryModule } from './pr-summary/pr-summary.module';

@Module({
  imports: [PrSummaryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
