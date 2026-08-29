import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '987654321', description: 'National number without country code' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '+51' })
  @IsString()
  countryCode: string;
}
