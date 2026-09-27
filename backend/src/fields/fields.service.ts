import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateFieldDto } from './dto/create-field.dto.js';
import { UpdateFieldDto } from './dto/update-field.dto.js';

interface FieldPhotoRow {
  id: string;
  url: string;
  isCover: boolean;
}

export interface PromotionRow {
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
}

export interface ReviewRow {
  id: string;
  fieldId: string;
  playerId: string;
  rating: number;
  comment: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface FieldRow {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  description: string | null;
  type: string;
  surface: string | null;
  capacity: number | null;
  basePricePerHour: number;
  weekendSurcharge: number | null;
  nightSurcharge: number | null;
  status: string;
  amenities: unknown;
  hasFullVaso: boolean;
  fullVasoPromo: string | null;
  photos?: FieldPhotoRow[];
  promotions?: PromotionRow[];
  reviews?: ReviewRow[];
  _count?: { bookings: number; reviews: number };
  createdAt: Date;
  updatedAt: Date;
}

function serializeField(field: FieldRow) {
  const photos = field.photos ?? [];
  const promotions = field.promotions ?? [];
  const stats = {
    bookingsCount: field._count?.bookings ?? 0,
    reviewsCount: field._count?.reviews ?? 0,
  };
  const base = {
    id: field.id,
    name: field.name,
    address: field.address,
    description: field.description,
    type: field.type,
    surface: field.surface,
    capacity: field.capacity,
    amenities: field.amenities ?? {},
    basePricePerHour: field.basePricePerHour,
    weekendSurcharge: field.weekendSurcharge,
    nightSurcharge: field.nightSurcharge,
    status: field.status,
    hasFullVaso: field.hasFullVaso,
    fullVasoPromo: field.fullVasoPromo,
    photos: photos.map((p) => ({ id: p.id, url: p.url, isCover: p.isCover })),
    promotions,
    stats,
    createdAt: field.createdAt,
    updatedAt: field.updatedAt,
  };
  if (field.reviews) {
    const reviews = field.reviews;
    const rating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    return { ...base, reviews, rating, reviewCount: reviews.length };
  }
  return base;
}

@Injectable()
export class FieldsService {
  constructor(private readonly prisma: PrismaService) {}

  async listFields() {
    const fields = await this.prisma.field.findMany({
      include: {
        photos: true,
        promotions: { where: { isActive: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
    });
    return fields.map((f) => serializeField(f));
  }

  async getFieldDetail(fieldId: string) {
    const field = await this.prisma.field.findUnique({
      where: { id: fieldId },
      include: {
        photos: true,
        promotions: { where: { isActive: true } },
        reviews: true,
        _count: { select: { bookings: true, reviews: true } },
      },
    });
    if (!field) {
      throw new NotFoundException('Field not found');
    }
    return serializeField(field);
  }

  async getAvailability(fieldId: string, startDate: string, endDate: string) {
    const field = await this.prisma.field.findUnique({
      where: { id: fieldId },
      select: { id: true, name: true },
    });
    if (!field) {
      throw new NotFoundException('Field not found');
    }
    const [bookings, blocks] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          fieldId,
          status: { in: ['pending', 'confirmed'] },
          startTime: { lt: new Date(endDate) },
          endTime: { gt: new Date(startDate) },
        },
        select: { id: true, startTime: true, endTime: true },
      }),
      this.prisma.scheduleBlock.findMany({
        where: {
          fieldId,
          startTime: { lt: new Date(endDate) },
          endTime: { gt: new Date(startDate) },
        },
        select: { id: true, startTime: true, endTime: true, reason: true },
      }),
    ]);
    const unavailableSlots = [
      ...bookings.map((b) => ({
        id: b.id,
        startTime: b.startTime,
        endTime: b.endTime,
        type: 'booking' as const,
        reason: null,
      })),
      ...blocks.map((s) => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        type: 'block' as const,
        reason: s.reason,
      })),
    ].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    return {
      fieldId: field.id,
      fieldName: field.name,
      startDate,
      endDate,
      unavailableSlots,
    };
  }

  async listManagerFields(userId: string) {
    const fields = await this.prisma.field.findMany({
      where: { ownerId: userId },
      include: {
        photos: true,
        promotions: true,
        _count: { select: { bookings: true, reviews: true } },
      },
    });
    return fields.map((f) => serializeField(f));
  }

  async createManagerField(userId: string, dto: CreateFieldDto) {
    const field = await this.prisma.field.create({
      data: {
        ownerId: userId,
        name: dto.name,
        address: dto.address,
        description: dto.description,
        type: dto.type ?? '7v7',
        amenities: dto.amenities ?? {},
        basePricePerHour: dto.basePricePerHour,
      },
      include: {
        photos: true,
        promotions: true,
        _count: { select: { bookings: true, reviews: true } },
      },
    });
    return { message: 'Field created', field: serializeField(field) };
  }

  async getManagerField(userId: string, fieldId: string) {
    const field = await this.prisma.field.findUnique({
      where: { id: fieldId },
      include: {
        photos: true,
        promotions: true,
        _count: { select: { bookings: true, reviews: true } },
      },
    });
    if (!field) {
      throw new NotFoundException('Field not found');
    }
    if (field.ownerId !== userId) {
      throw new ForbiddenException('You do not own this field');
    }
    return serializeField(field);
  }

  async updateManagerField(userId: string, fieldId: string, dto: UpdateFieldDto) {
    const field = await this.prisma.field.findUnique({ where: { id: fieldId } });
    if (!field) {
      throw new NotFoundException('Field not found');
    }
    if (field.ownerId !== userId) {
      throw new ForbiddenException('You do not own this field');
    }
    const updated = await this.prisma.field.update({
      where: { id: fieldId },
      data: dto,
      include: {
        photos: true,
        promotions: true,
        _count: { select: { bookings: true, reviews: true } },
      },
    });
    return { message: 'Field updated', field: serializeField(updated) };
  }

  async deleteManagerField(userId: string, fieldId: string) {
    const field = await this.prisma.field.findUnique({ where: { id: fieldId } });
    if (!field) {
      throw new NotFoundException('Field not found');
    }
    if (field.ownerId !== userId) {
      throw new ForbiddenException('You do not own this field');
    }
    await this.prisma.field.delete({ where: { id: fieldId } });
    return { message: 'Field deleted' };
  }
}
