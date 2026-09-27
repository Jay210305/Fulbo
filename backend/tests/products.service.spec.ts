import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProductsService } from '../src/products/products.service.js';

const ownedField = { id: 'f1', ownerId: 'm1', name: 'Cancha Principal' };

const productRow = {
  id: 'pr1',
  fieldId: 'f1',
  name: 'Gatorade',
  description: 'Bebida hidratante 500ml',
  price: 5,
  image: 'http://img/gatorade.jpg',
  category: 'bebida',
  isActive: true,
  createdAt: new Date('2026-09-01T00:00:00Z'),
  updatedAt: new Date('2026-09-01T00:00:00Z'),
  field: ownedField,
};

function makePrismaMock() {
  return {
    field: { findUnique: vi.fn() },
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

describe('ProductsService', () => {
  let prisma: ReturnType<typeof makePrismaMock>;
  let service: ProductsService;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new ProductsService(prisma as never);
  });

  describe('listFieldProducts', () => {
    it('returns the products of an owned field', async () => {
      prisma.field.findUnique.mockResolvedValue(ownedField);
      prisma.product.findMany.mockResolvedValue([productRow]);

      const result = await service.listFieldProducts('m1', 'f1');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: 'pr1', name: 'Gatorade', image: 'http://img/gatorade.jpg', imageUrl: 'http://img/gatorade.jpg' });
    });

    it('throws Forbidden for another manager field', async () => {
      prisma.field.findUnique.mockResolvedValue(ownedField);
      await expect(service.listFieldProducts('m2', 'f1')).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFound when the field does not exist', async () => {
      prisma.field.findUnique.mockResolvedValue(null);
      await expect(service.listFieldProducts('m1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createFieldProduct', () => {
    it('creates a product mapping imageUrl to the image column', async () => {
      prisma.field.findUnique.mockResolvedValue(ownedField);
      prisma.product.create.mockResolvedValue(productRow);

      const result = await service.createFieldProduct('m1', 'f1', {
        name: 'Powerade',
        price: 5,
        category: 'bebida',
        imageUrl: 'http://img/powerade.jpg',
      });

      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fieldId: 'f1',
            name: 'Powerade',
            price: 5,
            category: 'bebida',
            image: 'http://img/powerade.jpg',
          }),
        }),
      );
      expect(result.message).toBeTruthy();
      expect(result.product.name).toBe('Gatorade');
    });
  });

  describe('getProduct', () => {
    it('returns the product with fieldId and fieldName', async () => {
      prisma.product.findUnique.mockResolvedValue(productRow);

      const result = await service.getProduct('m1', 'pr1');

      expect(result).toMatchObject({
        id: 'pr1',
        fieldId: 'f1',
        fieldName: 'Cancha Principal',
      });
    });

    it('throws Forbidden when the product belongs to another manager field', async () => {
      prisma.product.findUnique.mockResolvedValue(productRow);
      await expect(service.getProduct('m2', 'pr1')).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFound when the product does not exist', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      await expect(service.getProduct('m1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProduct', () => {
    it('updates the product and returns it', async () => {
      prisma.product.findUnique.mockResolvedValue(productRow);
      prisma.product.update.mockResolvedValue({ ...productRow, price: 6 });

      const result = await service.updateProduct('m1', 'pr1', { price: 6 });

      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'pr1' }, data: { price: 6 } }),
      );
      expect(result.product.price).toBe(6);
    });

    it('throws Forbidden for another manager product', async () => {
      prisma.product.findUnique.mockResolvedValue(productRow);
      await expect(service.updateProduct('m2', 'pr1', { price: 6 })).rejects.toThrow(ForbiddenException);
      expect(prisma.product.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteProduct', () => {
    it('deletes the product and returns a message', async () => {
      prisma.product.findUnique.mockResolvedValue(productRow);
      prisma.product.delete.mockResolvedValue(productRow);

      const result = await service.deleteProduct('m1', 'pr1');

      expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 'pr1' } });
      expect(result.message).toBeTruthy();
    });
  });

  describe('toggleProductActive', () => {
    it('flips isActive and returns { id, isActive }', async () => {
      prisma.product.findUnique.mockResolvedValue(productRow);
      prisma.product.update.mockResolvedValue({ ...productRow, isActive: false });

      const result = await service.toggleProductActive('m1', 'pr1');

      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'pr1' }, data: { isActive: false } }),
      );
      expect(result.product).toEqual({ id: 'pr1', isActive: false });
    });

    it('throws Forbidden for another manager product', async () => {
      prisma.product.findUnique.mockResolvedValue(productRow);
      await expect(service.toggleProductActive('m2', 'pr1')).rejects.toThrow(ForbiddenException);
    });
  });
});
