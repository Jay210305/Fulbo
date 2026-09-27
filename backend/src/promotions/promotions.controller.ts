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
import { PromotionsService } from './promotions.service.js';
import { CreatePromotionDto } from './dto/create-promotion.dto.js';
import { UpdatePromotionDto } from './dto/update-promotion.dto.js';

@ApiTags('manager')
@ApiBearerAuth()
@Roles(Role.manager)
@Controller('manager/fields/:fieldId/promotions')
export class FieldPromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  @ApiOperation({ summary: "List promotions of one of the manager's fields" })
  listFieldPromotions(
    @CurrentUser('id') userId: string,
    @Param('fieldId') fieldId: string,
  ) {
    return this.promotionsService.listFieldPromotions(userId, fieldId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a promotion for one of the manager fields' })
  createFieldPromotion(
    @CurrentUser('id') userId: string,
    @Param('fieldId') fieldId: string,
    @Body() dto: CreatePromotionDto,
  ) {
    return this.promotionsService.createFieldPromotion(userId, fieldId, dto);
  }
}

@ApiTags('manager')
@ApiBearerAuth()
@Roles(Role.manager)
@Controller('manager/promotions')
export class ManagerPromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get one promotion' })
  getPromotion(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) promotionId: string) {
    return this.promotionsService.getPromotion(userId, promotionId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update one promotion' })
  updatePromotion(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) promotionId: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    return this.promotionsService.updatePromotion(userId, promotionId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete one promotion' })
  deletePromotion(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) promotionId: string) {
    return this.promotionsService.deletePromotion(userId, promotionId);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate one promotion' })
  deactivate(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) promotionId: string) {
    return this.promotionsService.deactivatePromotion(userId, promotionId);
  }
}
