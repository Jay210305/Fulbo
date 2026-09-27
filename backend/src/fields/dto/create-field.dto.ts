import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateFieldDto {
  @ApiProperty({ example: 'Cancha Principal' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Av. Larco 123, Miraflores' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Cancha de césped sintético', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '7v7', required: false, description: 'Defaults to 7v7' })
  @IsOptional()
  @IsIn(['5v5', '7v7', '11v11'])
  type?: string;

  @ApiProperty({
    example: { floodlights: true, parking: false },
    required: false,
  })
  @IsOptional()
  @IsObject()
  amenities?: Record<string, boolean>;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  basePricePerHour: number;
}
