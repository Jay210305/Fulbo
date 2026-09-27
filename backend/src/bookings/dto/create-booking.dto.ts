import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class BookingProductDto {
  @ApiProperty({ example: 'uuid-of-the-product' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-of-the-field' })
  @IsString()
  @IsNotEmpty()
  fieldId: string;

  @ApiProperty({ example: '2026-10-03T20:00:00.000Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-10-03T22:00:00.000Z' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({
    type: [BookingProductDto],
    description: 'FulVaso items; the server prices them',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BookingProductDto)
  products?: BookingProductDto[];

  @ApiPropertyOptional({ example: 'yape' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'Pichanga de los viernes' })
  @IsOptional()
  @IsString()
  matchName?: string;

  // ponytail: the frontend type sends totalPrice; the server always
  // recomputes it, this field exists only to pass forbidNonWhitelisted.
  @ApiPropertyOptional({ example: 142, description: 'Ignored — computed server-side' })
  @IsOptional()
  totalPrice?: number;
}
