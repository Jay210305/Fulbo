import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ManagerBookingsQueryDto {
  @IsOptional()
  @IsIn(['pending', 'confirmed', 'cancelled'])
  @ApiPropertyOptional({ enum: ['pending', 'confirmed', 'cancelled'] })
  status?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  fieldId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'YYYY-MM-DD (inclusive range start)' })
  startDate?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'YYYY-MM-DD (inclusive range end)' })
  endDate?: string;
}
