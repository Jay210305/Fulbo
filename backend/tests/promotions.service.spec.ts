import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PromotionsService } from '../src/promotions/promotions.service.js';

const ownedField = { id: 'f1', ownerId: 'm1', name: 'Cancha Principal' };

const promotionRow = {
  id: 'promo1',
  fieldId: 'f1',
  title: '20% de descuento entre semana',
  description: 'Lunes a viernes antes de las 3pm',
  discountType: 'percentage',
  discountValue: 20,
  startDate: new Date('2026-09-01T00:00:00Z'),
  endDate: new Date('2026-10-01T00:00:00Z'),
  isActive: true,
  image: null,
  createdAt: new Date('2026-09-01T00:00:00Z'),
  updatedAt: new Date('2026-09-01T00:00:00Z'),
  field: ownedField,
};

function makePrismaMock() {
  return {
    field: { findUnique: vi.fn() },
    promotion: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

describe('PromotionsService', () => {
  let prisma: ReturnType<typeof makePrismaMock>;
  let service: PromotionsService;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new PromotionsService(prisma as never);
  });

  describe('listFieldPromotions', () => {
    it('returns the promotions of an owned field', async () => {
      prisma.field.findUnique.mockResolvedValue(ownedField);
      prisma.promotion.findMany.mockResolvedValue([promotionRow]);

      const result = await service.listFieldPromotions('m1', 'f1');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: 'promo1', discountType: 'percentage', discountValue: 20 });
    });

    it('throws Forbidden for another manager field', async () => {
      prisma.field.findUnique.mockResolvedValue(ownedField);
      await expect(service.listFieldPromotions('m2', 'f1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createFieldPromotion', () => {
    it('creates the promotion for the owned field', async () => {
      prisma.field.findUnique.mockResolvedValue(ownedField);
      prisma.promotion.create.mockResolvedValue(promotionRow);

      const result = await service.createFieldPromotion('m1', 'f1', {
        title: 'Lunes 2x1',
        discountType: 'two_for_one',
        discountValue: 0,
        startDate: '2026-09-01T00:00:00.000Z',
        endDate: '2026-10-01T00:00:00.000Z',
      });

      expect(prisma.promotion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fieldId: 'f1',
            title: 'Lunes 2x1',
            discountType: 'two_for_one',
            startDate: new Date('2026-09-01T00:00:00.000Z'),
            endDate: new Date('2026-10-01T00:00:00.000Z'),
          }),
        }),
      );
      expect(result.message).toBeTruthy();
      expect(result.promotion.title).toBe('20% de descuento entre semana');
    });

    it('throws Forbidden for another manager field', async () => {
      prisma.field.findUnique.mockResolvedValue(ownedField);
      await expect(
        service.createFieldPromotion('m2', 'f1', {
          title: 'X',
          discountType: 'percentage',
          discountValue: 10,
          startDate: '2026-09-01T00:00:00.000Z',
          endDate: '2026-10-01T00:00:00.000Z',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getPromotion', () => {
    it('returns the promotion with fieldName', async () => {
      prisma.promotion.findUnique.mockResolvedValue(promotionRow);

      const result = await service.getPromotion('m1', 'promo1');

      expect(result).toMatchObject({
        id: 'promo1',
        fieldId: 'f1',
        fieldName: 'Cancha Principal',
      });
    });

    it('throws NotFound when missing and Forbidden for others', async () => {
      prisma.promotion.findUnique.mockResolvedValue(null);
      await expect(service.getPromotion('m1', 'missing')).rejects.toThrow(NotFoundException);

      prisma.promotion.findUnique.mockResolvedValue(promotionRow);
      await expect(service.getPromotion('m2', 'promo1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updatePromotion', () => {
    it('updates the promotion', async () => {
      prisma.promotion.findUnique.mockResolvedValue(promotionRow);
      prisma.promotion.update.mockResolvedValue({ ...promotionRow, discountValue: 30 });

      const result = await service.updatePromotion('m1', 'promo1', { discountValue: 30 });

      expect(result.promotion.discountValue).toBe(30);
    });

    it('throws Forbidden for another manager promotion', async () => {
      prisma.promotion.findUnique.mockResolvedValue(promotionRow);
      await expect(service.updatePromotion('m2', 'promo1', { discountValue: 30 })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deletePromotion', () => {
    it('deletes and returns a message', async () => {
      prisma.promotion.findUnique.mockResolvedValue(promotionRow);
      prisma.promotion.delete.mockResolvedValue(promotionRow);

      const result = await service.deletePromotion('m1', 'promo1');

      expect(prisma.promotion.delete).toHaveBeenCalledWith({ where: { id: 'promo1' } });
      expect(result.message).toBeTruthy();
    });
  });

  describe('deactivatePromotion', () => {
    it('sets isActive false and returns { id, isActive }', async () => {
      prisma.promotion.findUnique.mockResolvedValue(promotionRow);
      prisma.promotion.update.mockResolvedValue({ ...promotionRow, isActive: false });

      const result = await service.deactivatePromotion('m1', 'promo1');

      expect(prisma.promotion.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'promo1' }, data: { isActive: false } }),
      );
      expect(result.promotion).toEqual({ id: 'promo1', isActive: false });
    });

    it('throws Forbidden for another manager promotion', async () => {
      prisma.promotion.findUnique.mockResolvedValue(promotionRow);
      await expect(service.deactivatePromotion('m2', 'promo1')).rejects.toThrow(ForbiddenException);
    });
  });
});
