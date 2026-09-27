import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBusinessProfileDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  businessName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  ruc?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  address?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  email?: string;
}
