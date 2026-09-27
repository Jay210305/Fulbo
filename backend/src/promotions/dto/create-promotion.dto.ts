import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DiscountType } from '../../generated/prisma/enums.js';

export class CreatePromotionDto {
  @ApiProperty({ example: 'Lunes 2x1' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '2x1 en cervezas todos los lunes', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DiscountType })
  @IsIn(['percentage', 'fixed_amount', 'two_for_one'])
  discountType: DiscountType;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-10-01T00:00:00.000Z' })
  @IsDateString()
  endDate: string;
}
