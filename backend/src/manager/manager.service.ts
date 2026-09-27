import { Injectable } from '@nestjs/common';
import type { Prisma, BookingStatus } from '../generated/prisma/client.js';
import type {
  BusinessProfile,
  PaymentSettings,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

interface BookingWithRelations {
  id: string;
  fieldId: string;
  playerId: string;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  player?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  } | null;
  field?: { id: string; name: string } | null;
}

export function serializeManagerBooking(row: BookingWithRelations) {
  return {
    id: row.id,
    fieldId: row.fieldId,
    fieldName: row.field?.name ?? '',
    startTime: row.startTime,
    endTime: row.endTime,
    totalPrice: row.totalPrice,
    status: row.status,
    paymentStatus: row.paymentStatus,
    createdAt: row.createdAt,
    customer: row.player
      ? {
          id: row.player.id,
          name: `${row.player.firstName} ${row.player.lastName}`,
          email: row.player.email,
          phone: row.player.phoneNumber,
        }
      : null,
  };
}

export interface ManagerStats {
  totalRevenue: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  uniqueCustomers: number;
  averageBookingValue: number;
}

export interface ChartPoint {
  day: string;
  date: string;
  ingresos: number;
}

export interface ManagerBookingsFilters {
  status?: string;
  fieldId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateBusinessProfileInput {
  businessName?: string;
  ruc?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface UpdatePaymentSettingsInput {
  yapeEnabled?: boolean;
  yapePhone?: string;
  plinEnabled?: boolean;
  plinPhone?: string;
  bankTransferEnabled?: boolean;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  bankCci?: string;
  cashEnabled?: boolean;
}

const DEFAULT_PAYMENT_SETTINGS = {
  yapeEnabled: false,
  yapePhone: null,
  plinEnabled: false,
  plinPhone: null,
  bankTransferEnabled: false,
  bankName: null,
  bankAccountNumber: null,
  bankAccountHolder: null,
  bankCci: null,
  cashEnabled: true,
};

function localDateKey(d: Date) {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

@Injectable()
export class ManagerService {
  constructor(private readonly prisma: PrismaService) {}

  private async ownFieldIds(userId: string): Promise<string[]> {
    const fields = await this.prisma.field.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    return fields.map((f) => f.id);
  }

  private periodStart(period: string | undefined): Date | null {
    if (period === 'today') {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    }
    if (period === 'week') return new Date(Date.now() - 7 * 86400_000);
    if (period === 'month') return new Date(Date.now() - 30 * 86400_000);
    return null;
  }

  async getStats(userId: string, period?: string): Promise<ManagerStats> {
    const ids = await this.ownFieldIds(userId);
    if (ids.length === 0) {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        uniqueCustomers: 0,
        averageBookingValue: 0,
      };
    }
    const start = this.periodStart(period);
    const where: Prisma.BookingWhereInput = {
      fieldId: { in: ids },
      ...(start ? { createdAt: { gte: start } } : {}),
    };
    const agg = await this.prisma.booking.aggregate({
      where: { ...where, status: 'confirmed', paymentStatus: 'succeeded' },
      _sum: { totalPrice: true },
    });
    const totalRevenue = agg._sum.totalPrice ?? 0;
    const groups = await this.prisma.booking.groupBy({
      by: ['status'],
      _count: { _all: true },
      where,
    });
    const by = (status: string) =>
      groups.find((g) => g.status === status)?._count._all ?? 0;
    const totalBookings = groups.reduce((sum, g) => sum + g._count._all, 0);
    const unique = await this.prisma.booking.findMany({
      where,
      distinct: ['playerId'],
      select: { playerId: true },
    });
    return {
      totalRevenue,
      totalBookings,
      confirmedBookings: by('confirmed'),
      pendingBookings: by('pending'),
      cancelledBookings: by('cancelled'),
      uniqueCustomers: unique.length,
      averageBookingValue: totalBookings
        ? Math.round((totalRevenue / totalBookings) * 100) / 100
        : 0,
    };
  }

  async getChart(userId: string, days?: number): Promise<ChartPoint[]> {
    const n =
      Number.isFinite(days) && (days as number) > 0
        ? Math.floor(days as number)
        : 7;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (n - 1));
    const ids = await this.ownFieldIds(userId);
    const perDay = new Map<string, number>();
    if (ids.length > 0) {
      const rows = await this.prisma.booking.findMany({
        where: {
          fieldId: { in: ids },
          status: 'confirmed',
          paymentStatus: 'succeeded',
          createdAt: { gte: start },
        },
        select: { createdAt: true, totalPrice: true },
      });
      for (const row of rows) {
        const key = localDateKey(row.createdAt);
        perDay.set(key, (perDay.get(key) ?? 0) + row.totalPrice);
      }
    }
    const chart: ChartPoint[] = [];
    for (let i = 0; i < n; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      chart.push({
        day: WEEKDAYS[d.getDay()],
        date: localDateKey(d),
        ingresos: perDay.get(localDateKey(d)) ?? 0,
      });
    }
    return chart;
  }

  async listBookings(userId: string, filters: ManagerBookingsFilters) {
    const ids = await this.ownFieldIds(userId);
    const where: Prisma.BookingWhereInput = { fieldId: { in: ids } };
    if (filters.status) where.status = filters.status as BookingStatus;
    if (filters.fieldId) where.AND = [{ fieldId: filters.fieldId }];
    if (filters.startDate) where.endTime = { gt: new Date(filters.startDate) };
    if (filters.endDate) where.startTime = { lt: new Date(filters.endDate) };
    const rows = await this.prisma.booking.findMany({
      where,
      include: {
        player: {
          select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true },
        },
        field: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'desc' },
    });
    return rows.map(serializeManagerBooking);
  }

  async getProfile(userId: string): Promise<{ profile: BusinessProfile | null }> {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
    });
    return { profile };
  }

  async updateProfile(userId: string, data: UpdateBusinessProfileInput) {
    // ponytail: create-branch cast — promote-to-manager always creates the row
    // first, so PUT only updates in practice; Phase 2 can require full payloads.
    const profile = await this.prisma.businessProfile.upsert({
      where: { userId },
      create: { userId, ...data } as Prisma.BusinessProfileUncheckedCreateInput,
      update: data,
    });
    return { message: 'Profile updated', profile };
  }

  async getPaymentSettings(userId: string): Promise<PaymentSettings | typeof DEFAULT_PAYMENT_SETTINGS> {
    const settings = await this.prisma.paymentSettings.findUnique({
      where: { userId },
    });
    return settings ?? DEFAULT_PAYMENT_SETTINGS;
  }

  async updatePaymentSettings(userId: string, data: UpdatePaymentSettingsInput) {
    const settings = await this.prisma.paymentSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    return { message: 'Payment settings updated', settings };
  }
}
