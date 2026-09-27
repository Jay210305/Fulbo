import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManagerService } from '../src/manager/manager.service.js';

const businessProfileRow = {
  id: 'bp1',
  userId: 'm1',
  businessName: 'Canchas S.A.C.',
  ruc: '20123456789',
  address: 'Av. La Merced 123',
  phone: '+51912345678',
  email: 'manager@fulbo.com',
  createdAt: new Date('2026-09-01T00:00:00Z'),
  updatedAt: new Date('2026-09-01T00:00:00Z'),
};

const paymentSettingsRow = {
  id: 'ps1',
  userId: 'm1',
  yapeEnabled: true,
  yapePhone: '+51912345678',
  plinEnabled: false,
  bankTransferEnabled: true,
  bankName: 'BCP',
  bankAccountNumber: '1931234567890',
  bankAccountHolder: 'María Gómez',
  bankAccountType: 'ahorros',
  bankCci: '00219312345678901234',
  cashEnabled: true,
  createdAt: new Date('2026-09-01T00:00:00Z'),
  updatedAt: new Date('2026-09-01T00:00:00Z'),
};

const bookingRows = [
  {
    id: 'b1',
    fieldId: 'f1',
    playerId: 'u1',
    startTime: new Date('2026-10-06T01:00:00Z'),
    endTime: new Date('2026-10-06T02:00:00Z'),
    totalPrice: 100,
    status: 'confirmed',
    paymentStatus: 'succeeded',
    createdAt: new Date('2026-09-25T00:00:00Z'),
    player: { id: 'u1', firstName: 'Diego', lastName: 'Torres', email: 'd@example.com', phoneNumber: '+51987654321' },
    field: { id: 'f1', name: 'Canchita' },
  },
  {
    id: 'b2',
    fieldId: 'f1',
    playerId: 'u2',
    startTime: new Date('2026-10-07T01:00:00Z'),
    endTime: new Date('2026-10-07T02:00:00Z'),
    totalPrice: 150,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date('2026-09-26T00:00:00Z'),
    player: { id: 'u2', firstName: 'Ana', lastName: 'Ríos', email: 'a@example.com', phoneNumber: '+51981234567' },
    field: { id: 'f1', name: 'Canchita' },
  },
];

function makePrismaMock() {
  return {
    field: { findMany: vi.fn() },
    booking: {
      aggregate: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    businessProfile: { findUnique: vi.fn(), upsert: vi.fn() },
    paymentSettings: { findUnique: vi.fn(), upsert: vi.fn() },
  };
}

describe('ManagerService', () => {
  let prisma: ReturnType<typeof makePrismaMock>;
  let service: ManagerService;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new ManagerService(prisma as never);
    prisma.field.findMany.mockResolvedValue([{ id: 'f1' }, { id: 'f2' }]);
  });

  describe('getStats', () => {
    it('aggregates revenue, status counts and unique customers', async () => {
      prisma.booking.aggregate.mockResolvedValue({ _sum: { totalPrice: 250 } });
      prisma.booking.groupBy.mockResolvedValue([
        { status: 'confirmed', _count: { _all: 1 } },
        { status: 'pending', _count: { _all: 1 } },
        { status: 'cancelled', _count: { _all: 2 } },
      ]);
      prisma.booking.findMany.mockResolvedValue([{ playerId: 'u1' }, { playerId: 'u2' }]);

      const stats = await service.getStats('m1', 'all');

      expect(stats).toEqual({
        totalRevenue: 250,
        totalBookings: 4,
        confirmedBookings: 1,
        pendingBookings: 1,
        cancelledBookings: 2,
        uniqueCustomers: 2,
        averageBookingValue: 62.5,
      });
      expect(prisma.booking.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fieldId: { in: ['f1', 'f2'] },
            status: 'confirmed',
            paymentStatus: 'succeeded',
          }),
        }),
      );
    });

    it('returns zeros when the manager owns no fields', async () => {
      prisma.field.findMany.mockResolvedValue([]);

      const stats = await service.getStats('m1', 'all');

      expect(stats).toEqual({
        totalRevenue: 0,
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        uniqueCustomers: 0,
        averageBookingValue: 0,
      });
      expect(prisma.booking.aggregate).not.toHaveBeenCalled();
    });

    it('scopes today/week/month periods to a createdAt cutoff', async () => {
      prisma.booking.aggregate.mockResolvedValue({ _sum: { totalPrice: null } });
      prisma.booking.groupBy.mockResolvedValue([]);
      prisma.booking.findMany.mockResolvedValue([]);

      await service.getStats('m1', 'week');

      const where = prisma.booking.groupBy.mock.calls[0][0].where;
      expect(where.createdAt).toBeDefined();
      expect(where.createdAt.gte).toBeInstanceOf(Date);
    });
  });

  describe('getChart', () => {
    it('groups confirmed+succeeded revenue per local day, zero-filled', async () => {
      const noon = new Date();
      noon.setHours(12, 0, 0, 0);
      prisma.booking.findMany.mockResolvedValue([
        { createdAt: noon, totalPrice: 100 },
        { createdAt: noon, totalPrice: 50 },
      ]);

      const chart = await service.getChart('m1', 7);

      expect(chart).toHaveLength(7);
      expect(chart).toHaveProperty('0.day');
      expect(chart).toHaveProperty('0.date');
      const last = chart[6];
      expect(last.ingresos).toBe(150);
      const zeros = chart.filter((d) => d.ingresos === 0);
      expect(zeros.length).toBe(6);
      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fieldId: { in: ['f1', 'f2'] },
            status: 'confirmed',
            paymentStatus: 'succeeded',
            createdAt: { gte: expect.any(Date) },
          }),
        }),
      );
    });

    it('defaults to 7 days for non-positive input', async () => {
      prisma.booking.findMany.mockResolvedValue([]);
      const chart = await service.getChart('m1', 0);
      expect(chart).toHaveLength(7);
    });
  });

  describe('listBookings', () => {
    it('lists own-field bookings with camelCase customer info', async () => {
      prisma.booking.findMany.mockResolvedValue(bookingRows);

      const rows = await service.listBookings('m1', {});

      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ fieldId: { in: ['f1', 'f2'] } }),
        }),
      );
      expect(rows[0]).toEqual({
        id: 'b1',
        fieldId: 'f1',
        fieldName: 'Canchita',
        startTime: bookingRows[0].startTime,
        endTime: bookingRows[0].endTime,
        totalPrice: 100,
        status: 'confirmed',
        paymentStatus: 'succeeded',
        createdAt: bookingRows[0].createdAt,
        customer: {
          id: 'u1',
          name: 'Diego Torres',
          email: 'd@example.com',
          phone: '+51987654321',
        },
      });
    });

    it('applies status, fieldId and date-range filters', async () => {
      prisma.booking.findMany.mockResolvedValue([]);

      await service.listBookings('m1', {
        status: 'confirmed',
        fieldId: 'f1',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
      });

      const where = prisma.booking.findMany.mock.calls[0][0].where;
      expect(where.status).toBe('confirmed');
      expect(where.fieldId).toEqual({ in: ['f1', 'f2'] });
      expect(where.startTime).toEqual({ lt: expect.any(Date) });
      expect(where.endTime).toEqual({ gt: expect.any(Date) });
    });
  });

  describe('profile', () => {
    it('returns the raw profile or null', async () => {
      prisma.businessProfile.findUnique.mockResolvedValue(businessProfileRow);
      expect((await service.getProfile('m1')).profile).toEqual(businessProfileRow);

      prisma.businessProfile.findUnique.mockResolvedValue(null);
      expect((await service.getProfile('m1')).profile).toBeNull();
    });

    it('upserts the profile and returns { message, profile }', async () => {
      prisma.businessProfile.upsert.mockResolvedValue(businessProfileRow);

      const result = await service.updateProfile('m1', { businessName: 'Nuevo' });

      expect(prisma.businessProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'm1' },
          create: expect.objectContaining({ userId: 'm1', businessName: 'Nuevo' }),
          update: expect.objectContaining({ businessName: 'Nuevo' }),
        }),
      );
      expect(result.message).toBeTruthy();
      expect(result.profile).toEqual(businessProfileRow);
    });
  });

  describe('payment settings', () => {
    it('returns the stored settings, or defaults when absent', async () => {
      prisma.paymentSettings.findUnique.mockResolvedValue(paymentSettingsRow);
      expect(await service.getPaymentSettings('m1')).toEqual(paymentSettingsRow);

      prisma.paymentSettings.findUnique.mockResolvedValue(null);
      const defaults = await service.getPaymentSettings('m1');
      expect(defaults.cashEnabled).toBe(true);
      expect(defaults.yapeEnabled).toBe(false);
    });

    it('upserts settings and returns { message, settings }', async () => {
      prisma.paymentSettings.upsert.mockResolvedValue(paymentSettingsRow);

      const result = await service.updatePaymentSettings('m1', { yapeEnabled: true, yapePhone: '+5191' });

      expect(prisma.paymentSettings.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'm1' },
          create: expect.objectContaining({ userId: 'm1', yapeEnabled: true }),
          update: expect.objectContaining({ yapeEnabled: true }),
        }),
      );
      expect(result.message).toBeTruthy();
      expect(result.settings).toEqual(paymentSettingsRow);
    });
  });
});
