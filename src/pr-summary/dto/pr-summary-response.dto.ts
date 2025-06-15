import { IsString, IsNumber, Min, Max } from 'class-validator';

export class PrSummaryResponseDto {
  @IsString()
  summary: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  risk_score: number;
}
