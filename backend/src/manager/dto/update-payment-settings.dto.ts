import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePaymentSettingsDto {
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  yapeEnabled?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  yapePhone?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  plinEnabled?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  plinPhone?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  bankTransferEnabled?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  bankName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  bankAccountHolder?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  bankCci?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  cashEnabled?: boolean;
}
