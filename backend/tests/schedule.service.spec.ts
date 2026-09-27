import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ScheduleService } from '../src/schedule/schedule.service.js';

const ownedField = { id: 'f1', ownerId: 'm1', name: 'Cancha Principal' };

const blockRow = {
  id: 's1',
  fieldId: 'f1',
  startTime: new Date('2026-10-01T12:00:00Z'),
  endTime: new Date('2026-10-01T13:00:00Z'),
  reason: 'maintenance',
  note: 'Cambio de césped',
  createdBy: 'm1',
  createdAt: new Date('2026-09-01T00:00:00Z'),
  field: ownedField,
};

const conflictingBooking = {
  id: 'b1',
  startTime: new Date('2026-10-01T12:00:00Z'),
  endTime: new Date('2026-10-01T13:00:00Z'),
  player: { firstName: 'Diego', lastName: 'Torres', email: 'diego@example.com' },
};

function makePrismaMock() {
  return {
    field: { findUnique: vi.fn() },
    scheduleBlock: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    booking: { findMany: vi.fn() },
  };
}

describe('ScheduleService', () => {
  let prisma: ReturnType<typeof makePrismaMock>;
  let service: ScheduleService;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new ScheduleService(prisma as never);
  });

  describe('listBlocks (all manager fields)', () => {
    it('filters by owner through the field relation and serializes fieldName', async () => {
      prisma.scheduleBlock.findMany.mockResolvedValue([blockRow]);

      const result = await service.listBlocks('m1', {
        startDate: '2026-10-01T00:00:00.000Z',
        endDate: '2026-10-02T00:00:00.000Z',
      });

      expect(prisma.scheduleBlock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            field: { ownerId: 'm1' },
            startTime: { lt: new Date('2026-10-02T00:00:00.000Z') },
            endTime: { gt: new Date('2026-10-01T00:00:00.000Z') },
          }),
        }),
      );
      expect(result[0]).toMatchObject({
        id: 's1',
        fieldId: 'f1',
        fieldName: 'Cancha Principal',
        reason: 'maintenance',
        note: 'Cambio de césped',
      });
    });
  });

  describe('listFieldBlocks', () => {
    it('returns blocks for an owned field', async () => {
      prisma.field.findUnique.mockResolvedValue(ownedField);
      prisma.scheduleBlock.findMany.mockResolvedValue([blockRow]);

      const result = await service.listFieldBlocks('m1', 'f1', {});

      expect(result[0].fieldName).toBe('Cancha Principal');
    });

    it('throws Forbidden for another manager field', async () => {
      prisma.field.findUnique.mockResolvedValue(ownedField);
      await expect(service.listFieldBlocks('m2', 'f1', {})).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getBlock', () => {
    it('returns the block with fieldName', async () => {
      prisma.scheduleBlock.findUnique.mockResolvedValue(blockRow);
      const result = await service.getBlock('m1', 's1');
      expect(result.fieldName).toBe('Cancha Principal');
    });

    it('throws NotFound missing and Forbidden others', async () => {
      prisma.scheduleBlock.findUnique.mockResolvedValue(null);
      await expect(service.getBlock('m1', 'missing')).rejects.toThrow(NotFoundException);
      prisma.scheduleBlock.findUnique.mockResolvedValue(blockRow);
      await expect(service.getBlock('m2', 's1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createBlock', () => {
    const dto = {
      fieldId: 'f1',
      startTime: '2026-10-01T12:00:00.000Z',
      endTime: '2026-10-01T13:00:00.000Z',
      reason: 'maintenance' as const,
      note: 'Cambio de césped',
    };

    it('throws 409 with booking conflicts when bookings overlap', async () => {
      prisma.field.findUnique.mockResolvedValue(ownedField);
      prisma.booking.findMany.mockResolvedValue([conflictingBooking]);

      let caught: unknown;
      try {
        await service.createBlock('m1', dto);
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(ConflictException);
      const res = (caught as ConflictException).getResponse() as Record<string, unknown>;
      expect(res.conflicts).toEqual([
        {
          bookingId: 'b1',
          startTime: conflictingBooking.startTime,
          endTime: conflictingBooking.endTime,
          customerName: 'Diego Torres',
          customerEmail: 'diego@example.com',
        },
      ]);
      expect(prisma.scheduleBlock.create).not.toHaveBeenCalled();
    });

    it('creates the block when there are no overlapping bookings', async () => {
      prisma.field.findUnique.mockResolvedValue(ownedField);
      prisma.booking.findMany.mockResolvedValue([]);
      prisma.scheduleBlock.create.mockResolvedValue(blockRow);

      const result = await service.createBlock('m1', dto);

      expect(prisma.scheduleBlock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fieldId: 'f1',
            startTime: new Date('2026-10-01T12:00:00.000Z'),
            endTime: new Date('2026-10-01T13:00:00.000Z'),
            reason: 'maintenance',
            createdBy: 'm1',
          }),
        }),
      );
      expect(result.message).toBeTruthy();
      expect(result.block.id).toBe('s1');
    });

    it('throws Forbidden for another manager field', async () => {
      prisma.field.findUnique.mockResolvedValue(ownedField);
      await expect(service.createBlock('m2', dto)).rejects.toThrow(ForbiddenException);
      expect(prisma.scheduleBlock.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteBlock', () => {
    it('deletes an owned block and returns a message', async () => {
      prisma.scheduleBlock.findUnique.mockResolvedValue(blockRow);
      prisma.scheduleBlock.delete.mockResolvedValue(blockRow);

      const result = await service.deleteBlock('m1', 's1');

      expect(prisma.scheduleBlock.delete).toHaveBeenCalledWith({ where: { id: 's1' } });
      expect(result.message).toBeTruthy();
    });

    it('throws Forbidden when the block belongs to another manager field', async () => {
      prisma.scheduleBlock.findUnique.mockResolvedValue(blockRow);
      await expect(service.deleteBlock('m2', 's1')).rejects.toThrow(ForbiddenException);
      expect(prisma.scheduleBlock.delete).not.toHaveBeenCalled();
    });

    it('throws NotFound when the block does not exist', async () => {
      prisma.scheduleBlock.findUnique.mockResolvedValue(null);
      await expect(service.deleteBlock('m1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });
});
