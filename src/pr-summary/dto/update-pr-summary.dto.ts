import { PartialType } from '@nestjs/mapped-types';
import { CreatePrSummaryDto } from './create-pr-summary.dto';

export class UpdatePrSummaryDto extends PartialType(CreatePrSummaryDto) {}
