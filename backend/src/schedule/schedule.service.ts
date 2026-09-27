import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateScheduleBlockDto } from './dto/create-schedule-block.dto.js';

interface BlockRow {
  id: string;
  fieldId: string;
  startTime: Date;
  endTime: Date;
  reason: string;
  note: string | null;
  createdBy: string;
  createdAt: Date;
  field?: { id: string; name: string; ownerId: string };
}

interface BlockFilters {
  startDate?: string;
  endDate?: string;
}

function serializeBlock(block: BlockRow) {
  return {
    id: block.id,
    fieldId: block.fieldId,
    fieldName: block.field?.name ?? null,
    startTime: block.startTime,
    endTime: block.endTime,
    reason: block.reason,
    note: block.note,
    createdAt: block.createdAt,
  };
}

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async listBlocks(userId: string, filters: BlockFilters) {
    const blocks = await this.prisma.scheduleBlock.findMany({
      where: {
        field: { ownerId: userId },
        ...(filters.endDate ? { startTime: { lt: new Date(filters.endDate) } } : {}),
        ...(filters.startDate ? { endTime: { gt: new Date(filters.startDate) } } : {}),
      },
      include: { field: { select: { id: true, name: true, ownerId: true } } },
      orderBy: { startTime: 'asc' },
    });
    return blocks.map((b) => serializeBlock(b));
  }

  async listFieldBlocks(userId: string, fieldId: string, filters: BlockFilters) {
    const field = await this.prisma.field.findUnique({ where: { id: fieldId } });
    if (!field) {
      throw new NotFoundException('Field not found');
    }
    if (field.ownerId !== userId) {
      throw new ForbiddenException('You do not own this field');
    }
    const blocks = await this.prisma.scheduleBlock.findMany({
      where: {
        fieldId,
        ...(filters.endDate ? { startTime: { lt: new Date(filters.endDate) } } : {}),
        ...(filters.startDate ? { endTime: { gt: new Date(filters.startDate) } } : {}),
      },
      include: { field: { select: { id: true, name: true, ownerId: true } } },
      orderBy: { startTime: 'asc' },
    });
    return blocks.map((b) => serializeBlock(b));
  }

  async getBlock(userId: string, blockId: string) {
    const block = await this.prisma.scheduleBlock.findUnique({
      where: { id: blockId },
      include: { field: { select: { id: true, name: true, ownerId: true } } },
    });
    if (!block) {
      throw new NotFoundException('Schedule block not found');
    }
    if (block.field.ownerId !== userId) {
      throw new ForbiddenException('You do not own this field');
    }
    return serializeBlock(block);
  }

  async createBlock(userId: string, dto: CreateScheduleBlockDto) {
    const field = await this.prisma.field.findUnique({ where: { id: dto.fieldId } });
    if (!field) {
      throw new NotFoundException('Field not found');
    }
    if (field.ownerId !== userId) {
      throw new ForbiddenException('You do not own this field');
    }
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    const conflicting = await this.prisma.booking.findMany({
      where: {
        fieldId: dto.fieldId,
        status: { in: ['pending', 'confirmed'] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        player: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    if (conflicting.length > 0) {
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: 'The schedule block conflicts with existing bookings',
        conflicts: conflicting.map((b) => ({
          bookingId: b.id,
          startTime: b.startTime,
          endTime: b.endTime,
          customerName: `${b.player.firstName} ${b.player.lastName}`,
          customerEmail: b.player.email,
        })),
      });
    }
    const block = await this.prisma.scheduleBlock.create({
      data: {
        fieldId: dto.fieldId,
        startTime,
        endTime,
        reason: dto.reason,
        note: dto.note,
        createdBy: userId,
      },
      include: { field: { select: { id: true, name: true, ownerId: true } } },
    });
    return { message: 'Schedule block created', block: serializeBlock(block) };
  }

  async deleteBlock(userId: string, blockId: string) {
    const block = await this.prisma.scheduleBlock.findUnique({
      where: { id: blockId },
      include: { field: { select: { id: true, name: true, ownerId: true } } },
    });
    if (!block) {
      throw new NotFoundException('Schedule block not found');
    }
    if (block.field.ownerId !== userId) {
      throw new ForbiddenException('You do not own this field');
    }
    await this.prisma.scheduleBlock.delete({ where: { id: blockId } });
    return { message: 'Schedule block deleted' };
  }
}
