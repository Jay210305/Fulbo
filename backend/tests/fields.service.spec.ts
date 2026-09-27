import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { FieldsService } from '../src/fields/fields.service.js';

const fieldRow = {
  id: 'f1',
  ownerId: 'm1',
  name: 'Cancha Principal',
  address: 'Av. Larco 123, Miraflores',
  description: 'Cancha de césped sintético',
  type: '7v7',
  surface: 'Sintético',
  capacity: 14,
  basePricePerHour: 50,
  weekendSurcharge: 10,
  nightSurcharge: 5,
  status: 'active',
  amenities: { floodlights: true, parking: true },
  hasFullVaso: true,
  fullVasoPromo: '2x1 en cervezas',
  photos: [{ id: 'p1', url: 'http://img/1.jpg', isCover: true, fieldId: 'f1', createdAt: new Date('2026-09-01T00:00:00Z') }],
  promotions: [{ id: 'pr1', fieldId: 'f1', title: 'Lunes 2x1', description: null, discountType: 'percentage', discountValue: 20, startDate: new Date('2026-09-01T00:00:00Z'), endDate: new Date('2026-12-01T00:00:00Z'), isActive: true, image: null, createdAt: new Date('2026-09-01T00:00:00Z'), updatedAt: new Date('2026-09-01T00:00:00Z') }],
  _count: { bookings: 18, reviews: 4 },
  createdAt: new Date('2026-09-01T00:00:00Z'),
  updatedAt: new Date('2026-09-01T00:00:00Z'),
};

function makePrismaMock() {
  return {
    field: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    booking: { findMany: vi.fn() },
    scheduleBlock: { findMany: vi.fn() },
  };
}

describe('FieldsService', () => {
  let prisma: ReturnType<typeof makePrismaMock>;
  let service: FieldsService;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new FieldsService(prisma as never);
  });

  describe('listFields (public)', () => {
    it('returns serialized fields and filters promotions to active ones', async () => {
      prisma.field.findMany.mockResolvedValue([fieldRow]);

      const result = await service.listFields();

      expect(prisma.field.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            promotions: { where: { isActive: true } },
          }),
        }),
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'f1',
        name: 'Cancha Principal',
        address: 'Av. Larco 123, Miraflores',
        type: '7v7',
        basePricePerHour: 50,
        amenities: { floodlights: true, parking: true },
        hasFullVaso: true,
        photos: [{ id: 'p1', url: 'http://img/1.jpg', isCover: true }],
        stats: { bookingsCount: 18, reviewsCount: 4 },
      });
    });
  });

  describe('getFieldDetail (public)', () => {
    it('returns the field with rating and reviewCount computed from reviews', async () => {
      prisma.field.findUnique.mockResolvedValue({
        ...fieldRow,
        reviews: [
          { id: 'r1', rating: 5, comment: null, tags: [], playerId: 'u2', fieldId: 'f1', createdAt: new Date('2026-09-01T00:00:00Z'), updatedAt: new Date('2026-09-01T00:00:00Z') },
          { id: 'r2', rating: 3, comment: null, tags: [], playerId: 'u3', fieldId: 'f1', createdAt: new Date('2026-09-01T00:00:00Z'), updatedAt: new Date('2026-09-01T00:00:00Z') },
        ],
      });

      const result = await service.getFieldDetail('f1');

      expect(result.rating).toBe(4);
      expect(result.reviewCount).toBe(2);
      expect(result.reviews).toHaveLength(2);
      expect(result.stats).toEqual({ bookingsCount: 18, reviewsCount: 4 });
    });

    it('throws NotFound when the field does not exist', async () => {
      prisma.field.findUnique.mockResolvedValue(null);
      await expect(service.getFieldDetail('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAvailability (public)', () => {
    it('merges overlapping bookings and blocks into unavailableSlots sorted by startTime', async () => {
      prisma.field.findUnique.mockResolvedValue(fieldRow);
      prisma.booking.findMany.mockResolvedValue([
        {
          id: 'b2',
          startTime: new Date('2026-10-01T14:00:00Z'),
          endTime: new Date('2026-10-01T15:00:00Z'),
        },
        {
          id: 'b1',
          startTime: new Date('2026-10-01T10:00:00Z'),
          endTime: new Date('2026-10-01T11:00:00Z'),
        },
      ]);
      prisma.scheduleBlock.findMany.mockResolvedValue([
        {
          id: 's1',
          startTime: new Date('2026-10-01T12:00:00Z'),
          endTime: new Date('2026-10-01T13:00:00Z'),
          reason: 'maintenance',
        },
      ]);

      const result = await service.getAvailability(
        'f1',
        '2026-10-01T00:00:00.000Z',
        '2026-10-02T00:00:00.000Z',
      );

      expect(result).toMatchObject({
        fieldId: 'f1',
        fieldName: 'Cancha Principal',
        startDate: '2026-10-01T00:00:00.000Z',
        endDate: '2026-10-02T00:00:00.000Z',
      });
      expect(result.unavailableSlots.map((s: { id: string }) => s.id)).toEqual(['b1', 's1', 'b2']);
      expect(result.unavailableSlots[1]).toMatchObject({ type: 'block', reason: 'maintenance' });
      expect(result.unavailableSlots[0]).toMatchObject({ type: 'booking', reason: null });
    });

    it('queries only pending/confirmed bookings overlapping the range', async () => {
      prisma.field.findUnique.mockResolvedValue(fieldRow);
      prisma.booking.findMany.mockResolvedValue([]);
      prisma.scheduleBlock.findMany.mockResolvedValue([]);

      await service.getAvailability('f1', '2026-10-01T00:00:00.000Z', '2026-10-02T00:00:00.000Z');

      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            fieldId: 'f1',
            status: { in: ['pending', 'confirmed'] },
            startTime: { lt: new Date('2026-10-02T00:00:00.000Z') },
            endTime: { gt: new Date('2026-10-01T00:00:00.000Z') },
          },
        }),
      );
      expect(prisma.scheduleBlock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            fieldId: 'f1',
            startTime: { lt: new Date('2026-10-02T00:00:00.000Z') },
            endTime: { gt: new Date('2026-10-01T00:00:00.000Z') },
          },
        }),
      );
    });

    it('throws NotFound when the field does not exist', async () => {
      prisma.field.findUnique.mockResolvedValue(null);
      await expect(
        service.getAvailability('missing', '2026-10-01T00:00:00.000Z', '2026-10-02T00:00:00.000Z'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listManagerFields', () => {
    it('returns only the manager fields including inactive promotions', async () => {
      prisma.field.findMany.mockResolvedValue([fieldRow]);

      const result = await service.listManagerFields('m1');

      expect(prisma.field.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ownerId: 'm1' },
          include: expect.objectContaining({ promotions: true }),
        }),
      );
      expect(result[0].stats).toEqual({ bookingsCount: 18, reviewsCount: 4 });
    });
  });

  describe('createManagerField', () => {
    it('creates the field for the manager with defaults for amenities and type', async () => {
      prisma.field.create.mockResolvedValue({
        ...fieldRow,
        id: 'f-new',
        name: 'Cancha Nueva',
        basePricePerHour: 40,
        amenities: undefined,
        type: '7v7',
        photos: [],
        promotions: [],
        _count: undefined,
      });

      const result = await service.createManagerField('m1', {
        name: 'Cancha Nueva',
        address: 'Av. Larco 123',
        basePricePerHour: 40,
      });

      expect(prisma.field.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ownerId: 'm1',
            name: 'Cancha Nueva',
            address: 'Av. Larco 123',
            basePricePerHour: 40,
            amenities: {},
            type: '7v7',
          }),
        }),
      );
      expect(result.message).toBeTruthy();
      expect(result.field).toMatchObject({ name: 'Cancha Nueva', stats: { bookingsCount: 0, reviewsCount: 0 } });
    });
  });

  describe('getManagerField', () => {
    it('returns the field for its owner', async () => {
      prisma.field.findUnique.mockResolvedValue(fieldRow);
      const result = await service.getManagerField('m1', 'f1');
      expect(result.id).toBe('f1');
    });

    it('throws NotFound for a missing field', async () => {
      prisma.field.findUnique.mockResolvedValue(null);
      await expect(service.getManagerField('m1', 'missing')).rejects.toThrow(NotFoundException);
    });

    it('throws Forbidden for another manager field', async () => {
      prisma.field.findUnique.mockResolvedValue(fieldRow);
      await expect(service.getManagerField('m2', 'f1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateManagerField', () => {
    it('updates only the provided fields and returns the updated field', async () => {
      prisma.field.findUnique.mockResolvedValue(fieldRow);
      prisma.field.update.mockResolvedValue({ ...fieldRow, basePricePerHour: 60 });

      const result = await service.updateManagerField('m1', 'f1', { basePricePerHour: 60 });

      expect(prisma.field.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'f1' },
          data: { basePricePerHour: 60 },
        }),
      );
      expect(result.field.basePricePerHour).toBe(60);
    });

    it('throws Forbidden when the field belongs to another manager', async () => {
      prisma.field.findUnique.mockResolvedValue(fieldRow);
      await expect(service.updateManagerField('m2', 'f1', { name: 'X' })).rejects.toThrow(ForbiddenException);
      expect(prisma.field.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteManagerField', () => {
    it('deletes the field and returns a message', async () => {
      prisma.field.findUnique.mockResolvedValue(fieldRow);
      prisma.field.delete.mockResolvedValue(fieldRow);

      const result = await service.deleteManagerField('m1', 'f1');

      expect(prisma.field.delete).toHaveBeenCalledWith({ where: { id: 'f1' } });
      expect(result.message).toBeTruthy();
    });

    it('throws Forbidden when the field belongs to another manager', async () => {
      prisma.field.findUnique.mockResolvedValue(fieldRow);
      await expect(service.deleteManagerField('m2', 'f1')).rejects.toThrow(ForbiddenException);
      expect(prisma.field.delete).not.toHaveBeenCalled();
    });
  });
});
