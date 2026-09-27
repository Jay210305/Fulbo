import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ProductCategory } from '../../generated/prisma/enums.js';

export class CreateProductDto {
  @ApiProperty({ example: 'Gatorade' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Bebida hidratante 500ml', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'http://img/gatorade.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ enum: ProductCategory })
  @IsIn(['bebida', 'snack', 'equipo', 'promocion'])
  category: ProductCategory;
}
