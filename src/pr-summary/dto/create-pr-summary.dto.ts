import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreatePrSummaryDto {
  @IsString()
  @IsNotEmpty()
  repo: string;

  @IsNumber()
  @IsNotEmpty()
  pr_number: number;
}
