import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BookingsService } from '../src/bookings/bookings.service.js';

const userRow = {
  id: 'u1',
  email: 'diego@example.com',
  firstName: 'Diego',
  lastName: 'Torres',
  phoneNumber: '+51987654321',
  phoneVerified: true,
  role: 'player',
};

const fieldRow = {
  id: 'f1',
  ownerId: 'm1',
  name: 'Cancha Principal',
  address: 'Av. Larco 123',
  basePricePerHour: 50,
  weekendSurcharge: 10,
  nightSurcharge: 5,
};

const bookingRow = {
  id: 'b1',
  playerId: 'u1',
  fieldId: 'f1',
  startTime: new Date(2026, 9, 3, 20, 0, 0),
  endTime: new Date(2026, 9, 3, 22, 0, 0),
  totalPrice: 142,
  status: 'pending',
  paymentMethod: 'yape',
  paymentStatus: 'pending',
  matchName: 'Pichanga',
  createdAt: new Date('2026-09-01T00:00:00Z'),
  updatedAt: new Date('2026-09-01T00:00:00Z'),
  field: fieldRow,
};

function makePrismaMock() {
  const mock = {
    user: { findUnique: vi.fn() },
    field: { findUnique: vi.fn() },
    booking: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    scheduleBlock: { findMany: vi.fn() },
    product: { findMany: vi.fn() },
    bookingProduct: { createMany: vi.fn() },
    $transaction: vi.fn(),
  };
  mock.booking.findMany.mockResolvedValue([]);
  mock.scheduleBlock.findMany.mockResolvedValue([]);
  mock.product.findMany.mockResolvedValue([]);
  mock.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => cb(mock));
  return mock;
}

function makeService(prisma: ReturnType<typeof makePrismaMock>) {
  const config = new ConfigService({ FULVASO_SERVICE_FEE: 2 });
  return new BookingsService(prisma as never, config);
}

describe('BookingsService', () => {
  let prisma: ReturnType<typeof makePrismaMock>;
  let service: BookingsService;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = makeService(prisma);
  });

  describe('createBooking', () => {
    const dto = {
      fieldId: 'f1',
      startTime: '2026-10-03T20:00:00',
      endTime: '2026-10-03T22:00:00',
      products: [{ productId: 'p1', quantity: 2 }],
      paymentMethod: 'yape',
      matchName: 'Pichanga',
    };

    it('rejects unverified phones with 403', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...userRow, phoneVerified: false });

      await expect(service.createBooking('u1', dto)).rejects.toThrow(ForbiddenException);
      expect(prisma.booking.create).not.toHaveBeenCalled();
    });

    it('throws NotFound for a missing field', async () => {
      prisma.user.findUnique.mockResolvedValue(userRow);
      prisma.field.findUnique.mockResolvedValue(null);

      await expect(service.createBooking('u1', dto)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequest when endTime is not after startTime', async () => {
      prisma.user.findUnique.mockResolvedValue(userRow);
      prisma.field.findUnique.mockResolvedValue(fieldRow);

      await expect(
        service.createBooking('u1', {
          ...dto,
          startTime: '2026-10-03T20:00:00',
          endTime: '2026-10-03T20:00:00',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 409 with player-safe conflicts (no customer PII) on overlap', async () => {
      prisma.user.findUnique.mockResolvedValue(userRow);
      prisma.field.findUnique.mockResolvedValue(fieldRow);
      prisma.booking.findMany.mockResolvedValue([
        { id: 'bx', startTime: new Date(2026, 9, 3, 21, 0, 0), endTime: new Date(2026, 9, 3, 23, 0, 0) },
      ]);

      let caught: unknown;
      try {
        await service.createBooking('u1', dto);
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(ConflictException);
      const res = (caught as ConflictException).getResponse() as Record<string, unknown>;
      expect(res.conflicts).toEqual([
        {
          type: 'booking',
          startTime: new Date(2026, 9, 3, 21, 0, 0),
          endTime: new Date(2026, 9, 3, 23, 0, 0),
        },
      ]);
      expect(prisma.booking.create).not.toHaveBeenCalled();
    });

    it('throws 409 on schedule block overlap too', async () => {
      prisma.user.findUnique.mockResolvedValue(userRow);
      prisma.field.findUnique.mockResolvedValue(fieldRow);
      prisma.booking.findMany.mockResolvedValue([]);
      prisma.scheduleBlock.findMany.mockResolvedValue([
        { id: 's1', startTime: new Date(2026, 9, 3, 21, 0, 0), endTime: new Date(2026, 9, 3, 22, 0, 0) },
      ]);

      await expect(service.createBooking('u1', dto)).rejects.toThrow(ConflictException);
    });

    it('computes the price and creates booking + products in one transaction', async () => {
      prisma.user.findUnique.mockResolvedValue(userRow);
      prisma.field.findUnique.mockResolvedValue(fieldRow);
      prisma.booking.findMany.mockResolvedValue([]);
      prisma.scheduleBlock.findMany.mockResolvedValue([]);
      prisma.product.findMany.mockResolvedValue([
        { id: 'p1', fieldId: 'f1', price: 5, isActive: true },
      ]);
      prisma.booking.create.mockResolvedValue(bookingRow);

      const result = await service.createBooking('u1', dto);

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ['p1'] }, fieldId: 'f1', isActive: true },
        }),
      );
      expect(prisma.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            playerId: 'u1',
            fieldId: 'f1',
            startTime: new Date('2026-10-03T20:00:00'),
            endTime: new Date('2026-10-03T22:00:00'),
            // Saturday 20:00-22:00: base 100 + weekend 10*2 + night 5*2 + products 5*2 + fee 2
            totalPrice: 142,
            paymentMethod: 'yape',
            matchName: 'Pichanga',
          }),
        }),
      );
      expect(prisma.bookingProduct.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [{ bookingId: 'b1', productId: 'p1', quantity: 2, priceAtTime: 5 }],
        }),
      );
      expect(result).toMatchObject({
        booking_id: 'b1',
        player_id: 'u1',
        field_id: 'f1',
        total_price: 142,
        status: 'pending',
        fields: { field_id: 'f1', name: 'Cancha Principal', address: 'Av. Larco 123', owner_id: 'm1' },
      });
    });

    it('omits the service fee and product rows when there are no FulVaso items', async () => {
      prisma.user.findUnique.mockResolvedValue(userRow);
      prisma.field.findUnique.mockResolvedValue(fieldRow);
      prisma.booking.findMany.mockResolvedValue([]);
      prisma.scheduleBlock.findMany.mockResolvedValue([]);
      prisma.product.findMany.mockResolvedValue([]);
      prisma.booking.create.mockResolvedValue({ ...bookingRow, totalPrice: 130 });

      await service.createBooking('u1', { ...dto, products: [] });

      expect(prisma.bookingProduct.createMany).not.toHaveBeenCalled();
      expect(prisma.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalPrice: 130 }),
        }),
      );
    });

    it('throws BadRequest when a requested product is invalid for the field', async () => {
      prisma.user.findUnique.mockResolvedValue(userRow);
      prisma.field.findUnique.mockResolvedValue(fieldRow);
      prisma.booking.findMany.mockResolvedValue([]);
      prisma.scheduleBlock.findMany.mockResolvedValue([]);
      prisma.product.findMany.mockResolvedValue([]);

      await expect(service.createBooking('u1', dto)).rejects.toThrow(BadRequestException);
      expect(prisma.booking.create).not.toHaveBeenCalled();
    });
  });

  describe('getUserBookings', () => {
    it('returns snake_case player bookings with the nested field', async () => {
      prisma.booking.findMany.mockResolvedValue([bookingRow]);

      const result = await service.getUserBookings('u1');

      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { playerId: 'u1' } }),
      );
      expect(result[0]).toMatchObject({
        booking_id: 'b1',
        start_time: bookingRow.startTime,
        fields: { field_id: 'f1', name: 'Cancha Principal' },
      });
    });
  });

  describe('getFieldBookings', () => {
    it('returns bookings with the player info for the field owner', async () => {
      prisma.field.findUnique.mockResolvedValue(fieldRow);
      prisma.booking.findMany.mockResolvedValue([
        { ...bookingRow, player: userRow },
      ]);

      const result = await service.getFieldBookings('m1', 'f1', { from: '2026-10-01', to: '2026-10-31' });

      expect(result[0]).toMatchObject({
        booking_id: 'b1',
        users: {
          user_id: 'u1',
          first_name: 'Diego',
          last_name: 'Torres',
          email: 'diego@example.com',
          phone_number: '+51987654321',
        },
      });
    });

    it('throws Forbidden for another manager field', async () => {
      prisma.field.findUnique.mockResolvedValue(fieldRow);
      await expect(service.getFieldBookings('m2', 'f1', {})).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getBookingById', () => {
    it('returns the booking to its owner', async () => {
      prisma.booking.findUnique.mockResolvedValue(bookingRow);
      const result = await service.getBookingById('u1', 'b1');
      expect(result.booking_id).toBe('b1');
    });

    it('returns the booking to the field owner', async () => {
      prisma.booking.findUnique.mockResolvedValue(bookingRow);
      const result = await service.getBookingById('m1', 'b1');
      expect(result.booking_id).toBe('b1');
    });

    it('throws Forbidden for another player', async () => {
      prisma.booking.findUnique.mockResolvedValue(bookingRow);
      await expect(service.getBookingById('u2', 'b1')).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFound when missing', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);
      await expect(service.getBookingById('u1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelBooking', () => {
    it('cancels an own booking and returns it', async () => {
      prisma.booking.findUnique.mockResolvedValue(bookingRow);
      prisma.booking.update.mockResolvedValue({ ...bookingRow, status: 'cancelled' });

      const result = await service.cancelBooking('u1', 'b1');

      expect(prisma.booking.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'b1' }, data: { status: 'cancelled' } }),
      );
      expect(result.message).toBeTruthy();
      expect(result.booking.status).toBe('cancelled');
    });

    it('throws 409 when already cancelled', async () => {
      prisma.booking.findUnique.mockResolvedValue({ ...bookingRow, status: 'cancelled' });
      await expect(service.cancelBooking('u1', 'b1')).rejects.toThrow(ConflictException);
      expect(prisma.booking.update).not.toHaveBeenCalled();
    });

    it('throws Forbidden for another player', async () => {
      prisma.booking.findUnique.mockResolvedValue(bookingRow);
      await expect(service.cancelBooking('u2', 'b1')).rejects.toThrow(ForbiddenException);
    });
  });
});
