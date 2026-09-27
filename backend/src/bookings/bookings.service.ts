import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';

interface FieldLite {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  basePricePerHour: number;
  weekendSurcharge: number | null;
  nightSurcharge: number | null;
}

interface PlayerLite {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
}

interface BookingRow {
  id: string;
  playerId: string;
  fieldId: string;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  status: string;
  paymentMethod: string | null;
  paymentStatus: string;
  matchName: string | null;
  createdAt: Date;
  updatedAt: Date;
  field?: { id: string; ownerId: string; name: string; address: string };
  player?: PlayerLite;
}

function serializePlayerBooking(booking: BookingRow) {
  return {
    booking_id: booking.id,
    player_id: booking.playerId,
    field_id: booking.fieldId,
    start_time: booking.startTime,
    end_time: booking.endTime,
    total_price: booking.totalPrice,
    status: booking.status,
    payment_method: booking.paymentMethod,
    payment_status: booking.paymentStatus,
    match_name: booking.matchName,
    created_at: booking.createdAt,
    updated_at: booking.updatedAt,
    ...(booking.field
      ? {
          fields: {
            field_id: booking.field.id,
            name: booking.field.name,
            address: booking.field.address,
            owner_id: booking.field.ownerId,
          },
        }
      : {}),
  };
}

function serializeFieldBooking(booking: BookingRow) {
  return {
    booking_id: booking.id,
    player_id: booking.playerId,
    field_id: booking.fieldId,
    start_time: booking.startTime,
    end_time: booking.endTime,
    total_price: booking.totalPrice,
    status: booking.status,
    payment_method: booking.paymentMethod,
    payment_status: booking.paymentStatus,
    match_name: booking.matchName,
    created_at: booking.createdAt,
    updated_at: booking.updatedAt,
    ...(booking.player
      ? {
          users: {
            user_id: booking.player.id,
            first_name: booking.player.firstName,
            last_name: booking.player.lastName,
            email: booking.player.email,
            phone_number: booking.player.phoneNumber,
          },
        }
      : {}),
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class BookingsService {
  private readonly serviceFee: number;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    // ponytail: flat hardcoded fee until payments land in Phase 2; then move
    // it into PaymentSettings/business config.
    this.serviceFee = config.get<number>('FULVASO_SERVICE_FEE') ?? 2;
  }

  async createBooking(userId: string, dto: CreateBookingDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.phoneVerified) {
      throw new ForbiddenException('Phone verification required to book');
    }
    const field = await this.prisma.field.findUnique({ where: { id: dto.fieldId } });
    if (!field) {
      throw new NotFoundException('Field not found');
    }
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    if (!(endTime > startTime)) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const [overlappingBookings, overlappingBlocks] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          fieldId: field.id,
          status: { in: ['pending', 'confirmed'] },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
        select: { id: true, startTime: true, endTime: true },
      }),
      this.prisma.scheduleBlock.findMany({
        where: {
          fieldId: field.id,
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
        select: { id: true, startTime: true, endTime: true },
      }),
    ]);
    if (overlappingBookings.length > 0 || overlappingBlocks.length > 0) {
      const conflicts = [
        ...overlappingBookings.map((b) => ({
          type: 'booking' as const,
          startTime: b.startTime,
          endTime: b.endTime,
        })),
        ...overlappingBlocks.map((b) => ({
          type: 'block' as const,
          startTime: b.startTime,
          endTime: b.endTime,
        })),
      ];
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: 'The requested time is not available',
        conflicts,
      });
    }

    const items = dto.products ?? [];
    let products: { id: string; price: number }[] = [];
    if (items.length > 0) {
      products = await this.prisma.product.findMany({
        where: {
          id: { in: items.map((i) => i.productId) },
          fieldId: field.id,
          isActive: true,
        },
        select: { id: true, price: true },
      });
      if (products.length !== new Set(items.map((i) => i.productId)).size) {
        throw new BadRequestException('Invalid products for this field');
      }
    }

    const totalPrice = this.calculatePrice(field, startTime, endTime, items, products);

    const booking = await this.prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          playerId: userId,
          fieldId: field.id,
          startTime,
          endTime,
          totalPrice,
          paymentMethod: dto.paymentMethod,
          matchName: dto.matchName,
        },
        include: { field: true },
      });
      if (items.length > 0) {
        await tx.bookingProduct.createMany({
          data: items.map((i) => ({
            bookingId: created.id,
            productId: i.productId,
            quantity: i.quantity,
            priceAtTime: products.find((p) => p.id === i.productId)?.price ?? 0,
          })),
        });
      }
      return created;
    });
    return serializePlayerBooking(booking);
  }

  private calculatePrice(
    field: Pick<FieldLite, 'basePricePerHour' | 'weekendSurcharge' | 'nightSurcharge'>,
    startTime: Date,
    endTime: Date,
    items: { productId: string; quantity: number }[],
    products: { id: string; price: number }[],
  ) {
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / 3_600_000;
    // ponytail: 30-minute granularity on surcharges; sub-30min windows round
    // up to the nearest half hour like the UI duration options (1/1.5/2/3h).
    const segments = Math.ceil(durationHours * 2);
    let weekendHours = 0;
    let nightHours = 0;
    for (let i = 0; i < segments; i++) {
      const segStart = new Date(startTime.getTime() + i * 1_800_000);
      const day = segStart.getDay();
      const hour = segStart.getHours();
      if (day === 0 || day === 6) weekendHours += 0.5;
      if (hour >= 19 && hour < 23) nightHours += 0.5;
    }
    const base = field.basePricePerHour * durationHours;
    const weekend = (field.weekendSurcharge ?? 0) * weekendHours;
    const night = (field.nightSurcharge ?? 0) * nightHours;
    const productsTotal = items.reduce(
      (sum, i) => sum + (products.find((p) => p.id === i.productId)?.price ?? 0) * i.quantity,
      0,
    );
    const fee = items.length > 0 ? this.serviceFee : 0;
    return round2(base + weekend + night + productsTotal + fee);
  }

  async getUserBookings(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { playerId: userId },
      include: { field: true },
      orderBy: { startTime: 'desc' },
    });
    return bookings.map((b) => serializePlayerBooking(b));
  }

  async getFieldBookings(
    userId: string,
    fieldId: string,
    filters: { from?: string; to?: string },
  ) {
    const field = await this.prisma.field.findUnique({ where: { id: fieldId } });
    if (!field) {
      throw new NotFoundException('Field not found');
    }
    if (field.ownerId !== userId) {
      throw new ForbiddenException('You do not own this field');
    }
    const bookings = await this.prisma.booking.findMany({
      where: {
        fieldId,
        ...(filters.to ? { startTime: { lt: new Date(filters.to) } } : {}),
        ...(filters.from ? { endTime: { gt: new Date(filters.from) } } : {}),
      },
      include: { player: true },
      orderBy: { startTime: 'asc' },
    });
    return bookings.map((b) => serializeFieldBooking(b));
  }

  private async findAccessibleBooking(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { field: { select: { id: true, name: true, address: true, ownerId: true } } },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.playerId !== userId && booking.field.ownerId !== userId) {
      throw new ForbiddenException('You cannot access this booking');
    }
    return booking;
  }

  async getBookingById(userId: string, bookingId: string) {
    const booking = await this.findAccessibleBooking(userId, bookingId);
    return serializePlayerBooking(booking);
  }

  async cancelBooking(userId: string, bookingId: string) {
    const booking = await this.findAccessibleBooking(userId, bookingId);
    if (booking.status === 'cancelled') {
      throw new ConflictException('Booking already cancelled');
    }
    const cancelled = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
      include: { field: true },
    });
    return { message: 'Booking cancelled', booking: serializePlayerBooking(cancelled) };
  }
}
