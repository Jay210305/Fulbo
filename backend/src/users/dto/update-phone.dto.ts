import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePhoneDto {
  @ApiProperty({ example: '+51987654321', description: 'Full phone number with country code' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
