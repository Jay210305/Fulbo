import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PromoteToManagerDto {
  @ApiProperty({ example: 'Canchas Lima' })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({ example: '12345678901', description: 'Peruvian RUC (11 digits)' })
  @IsString()
  @IsNotEmpty()
  ruc: string;
}
