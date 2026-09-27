import { Module } from '@nestjs/common';
import { FieldProductsController, ManagerProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  controllers: [FieldProductsController, ManagerProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
