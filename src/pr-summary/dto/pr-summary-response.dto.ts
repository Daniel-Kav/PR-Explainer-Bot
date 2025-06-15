import { IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PrSummaryResponseDto {
  @ApiProperty({
    description: 'AI-generated summary of the pull request changes',
    example: 'This PR refactors the authentication module to improve performance and adds new validation rules for user input.',
  })
  @IsString()
  summary: string;

  @ApiProperty({
    description: 'Risk assessment score from 1 (low risk) to 5 (high risk)',
    minimum: 1,
    maximum: 5,
    example: 2,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  risk_score: number;
}
