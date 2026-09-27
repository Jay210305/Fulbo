import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@ApiTags('manager')
@ApiBearerAuth()
@Roles(Role.manager)
@Controller('manager/fields/:fieldId/products')
export class FieldProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: "List products of one of the manager's fields" })
  listFieldProducts(
    @CurrentUser('id') userId: string,
    @Param('fieldId') fieldId: string,
  ) {
    return this.productsService.listFieldProducts(userId, fieldId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a product for one of the manager fields' })
  createFieldProduct(
    @CurrentUser('id') userId: string,
    @Param('fieldId') fieldId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.createFieldProduct(userId, fieldId, dto);
  }
}

@ApiTags('manager')
@ApiBearerAuth()
@Roles(Role.manager)
@Controller('manager/products')
export class ManagerProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get one product with its field' })
  getProduct(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) productId: string) {
    return this.productsService.getProduct(userId, productId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update one product' })
  updateProduct(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(userId, productId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete one product' })
  deleteProduct(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) productId: string) {
    return this.productsService.deleteProduct(userId, productId);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle product active status' })
  toggleActive(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) productId: string) {
    return this.productsService.toggleProductActive(userId, productId);
  }
}
