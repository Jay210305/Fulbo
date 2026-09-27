import { Module } from '@nestjs/common';
import { FieldPromotionsController, ManagerPromotionsController } from './promotions.controller.js';
import { PromotionsService } from './promotions.service.js';

@Module({
  controllers: [FieldPromotionsController, ManagerPromotionsController],
  providers: [PromotionsService],
})
export class PromotionsModule {}
