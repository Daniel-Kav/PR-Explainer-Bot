import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePrSummaryDto {
  @ApiProperty({
    description: 'GitHub repository in format "owner/repo"',
    example: 'nestjs/nest',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  repo: string;

  @ApiProperty({
    description: 'Pull request number',
    example: 10000,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  pr_number: number;
}
