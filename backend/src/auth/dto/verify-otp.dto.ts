import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '987654321', description: 'National number without country code' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '+51' })
  @IsString()
  countryCode: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;
}
