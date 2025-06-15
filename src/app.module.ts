import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrSummaryModule } from './pr-summary/pr-summary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrSummaryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
