import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePromotionDto } from './dto/create-promotion.dto.js';
import { UpdatePromotionDto } from './dto/update-promotion.dto.js';

interface PromotionRow {
  id: string;
  fieldId: string;
  title: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  field?: { id: string; name: string; ownerId: string };
}

function serializePromotion(promotion: PromotionRow) {
  return {
    id: promotion.id,
    fieldId: promotion.fieldId,
    title: promotion.title,
    description: promotion.description,
    discountType: promotion.discountType,
    discountValue: promotion.discountValue,
    startDate: promotion.startDate,
    endDate: promotion.endDate,
    isActive: promotion.isActive,
    image: promotion.image,
    createdAt: promotion.createdAt,
    updatedAt: promotion.updatedAt,
    ...(promotion.field
      ? { fieldId: promotion.field.id, fieldName: promotion.field.name }
      : {}),
  };
}

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertFieldOwnership(userId: string, fieldId: string) {
    const field = await this.prisma.field.findUnique({ where: { id: fieldId } });
    if (!field) {
      throw new NotFoundException('Field not found');
    }
    if (field.ownerId !== userId) {
      throw new ForbiddenException('You do not own this field');
    }
    return field;
  }

  async listFieldPromotions(userId: string, fieldId: string) {
    await this.assertFieldOwnership(userId, fieldId);
    const promotions = await this.prisma.promotion.findMany({
      where: { fieldId },
      orderBy: { createdAt: 'asc' },
    });
    return promotions.map((p) => serializePromotion(p));
  }

  async createFieldPromotion(userId: string, fieldId: string, dto: CreatePromotionDto) {
    await this.assertFieldOwnership(userId, fieldId);
    const promotion = await this.prisma.promotion.create({
      data: {
        fieldId,
        title: dto.title,
        description: dto.description,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
    return { message: 'Promotion created', promotion: serializePromotion(promotion) };
  }

  private async findOwnedPromotion(userId: string, promotionId: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
      include: { field: { select: { id: true, name: true, ownerId: true } } },
    });
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }
    if (promotion.field.ownerId !== userId) {
      throw new ForbiddenException('You do not own this field');
    }
    return promotion;
  }

  async getPromotion(userId: string, promotionId: string) {
    const promotion = await this.findOwnedPromotion(userId, promotionId);
    return serializePromotion(promotion);
  }

  async updatePromotion(userId: string, promotionId: string, dto: UpdatePromotionDto) {
    const promotion = await this.findOwnedPromotion(userId, promotionId);
    const { startDate, endDate, ...rest } = dto;
    const updated = await this.prisma.promotion.update({
      where: { id: promotionId },
      data: {
        ...rest,
        ...(startDate !== undefined ? { startDate: new Date(startDate) } : {}),
        ...(endDate !== undefined ? { endDate: new Date(endDate) } : {}),
      },
    });
    return { message: 'Promotion updated', promotion: serializePromotion({ ...updated, field: promotion.field }) };
  }

  async deletePromotion(userId: string, promotionId: string) {
    await this.findOwnedPromotion(userId, promotionId);
    await this.prisma.promotion.delete({ where: { id: promotionId } });
    return { message: 'Promotion deleted' };
  }

  async deactivatePromotion(userId: string, promotionId: string) {
    await this.findOwnedPromotion(userId, promotionId);
    const updated = await this.prisma.promotion.update({
      where: { id: promotionId },
      data: { isActive: false },
    });
    return {
      message: 'Promotion deactivated',
      promotion: { id: updated.id, isActive: updated.isActive },
    };
  }
}
