import { prisma } from '../config/prisma';
import { schedule_block_reason } from '@prisma/client';

// --- DTOs ---
interface CreateScheduleBlockDto {
  startTime: Date;
  endTime: Date;
  reason: schedule_block_reason;
  note?: string;
}

interface ScheduleBlockFilters {
  startDate?: Date;
  endDate?: Date;
}

export class ScheduleBlockService {
  /**
   * Get all schedule blocks for a field (only if owned by the manager)
   */
  static async getBlocksByField(fieldId: string, ownerId: string, filters?: ScheduleBlockFilters) {
    // First verify field ownership
    const field = await prisma.fields.findFirst({
      where: {
        field_id: fieldId,
        owner_id: ownerId,
        deleted_at: null,
      },
    });

    if (!field) {
      return null;
    }

    const whereClause: any = {
      field_id: fieldId,
    };

    // Apply date filters if provided
    if (filters?.startDate || filters?.endDate) {
      whereClause.OR = [];
      
      if (filters.startDate && filters.endDate) {
        // Blocks that overlap with the given range
        whereClause.OR = [
          {
            start_time: { lte: filters.endDate },
            end_time: { gte: filters.startDate },
          },
        ];
      } else if (filters.startDate) {
        // Blocks that end after the start date
        whereClause.end_time = { gte: filters.startDate };
      } else if (filters.endDate) {
        // Blocks that start before the end date
        whereClause.start_time = { lte: filters.endDate };
      }
    }

    return prisma.schedule_blocks.findMany({
      where: whereClause,
      orderBy: { start_time: 'asc' },
      include: {
        fields: {
          select: { field_id: true, name: true },
        },
      },
    });
  }

  /**
   * Get all schedule blocks for all fields owned by a manager
   */
  static async getAllBlocksByOwner(ownerId: string, filters?: ScheduleBlockFilters) {
    const whereClause: any = {
      fields: {
        owner_id: ownerId,
        deleted_at: null,
      },
    };

    // Apply date filters if provided
    if (filters?.startDate && filters?.endDate) {
      whereClause.start_time = { lte: filters.endDate };
      whereClause.end_time = { gte: filters.startDate };
    }

    return prisma.schedule_blocks.findMany({
      where: whereClause,
      orderBy: { start_time: 'asc' },
      include: {
        fields: {
          select: { field_id: true, name: true },
        },
      },
    });
  }

  /**
   * Get a specific schedule block (only if the field is owned by the manager)
   */
  static async getBlockById(blockId: string, ownerId: string) {
    return prisma.schedule_blocks.findFirst({
      where: {
        block_id: blockId,
        fields: {
          owner_id: ownerId,
          deleted_at: null,
        },
      },
      include: {
        fields: {
          select: { field_id: true, name: true },
        },
      },
    });
  }

  /**
   * Check for existing confirmed bookings in a time range
   * Returns the conflicting bookings if any exist
   */
  static async checkBookingConflicts(fieldId: string, startTime: Date, endTime: Date) {
    const conflicts = await prisma.bookings.findMany({
      where: {
        field_id: fieldId,
        status: { not: 'cancelled' },
        OR: [
          {
            // Booking starts within the block range
            start_time: { gte: startTime, lt: endTime },
          },
          {
            // Booking ends within the block range
            end_time: { gt: startTime, lte: endTime },
          },
          {
            // Booking encompasses the entire block range
            start_time: { lte: startTime },
            end_time: { gte: endTime },
          },
        ],
      },
      include: {
        users: {
          select: { first_name: true, last_name: true, email: true },
        },
      },
      orderBy: { start_time: 'asc' },
    });

    return conflicts;
  }

  /**
   * Check for overlapping schedule blocks
   */
  static async checkBlockOverlaps(fieldId: string, startTime: Date, endTime: Date, excludeBlockId?: string) {
    const whereClause: any = {
      field_id: fieldId,
      OR: [
        {
          start_time: { gte: startTime, lt: endTime },
        },
        {
          end_time: { gt: startTime, lte: endTime },
        },
        {
          start_time: { lte: startTime },
          end_time: { gte: endTime },
        },
      ],
    };

    if (excludeBlockId) {
      whereClause.block_id = { not: excludeBlockId };
    }

    return prisma.schedule_blocks.findMany({
      where: whereClause,
    });
  }

  /**
   * Create a schedule block for a field (only if owned by the manager)
   * Validates that there are no confirmed bookings in the time range
   */
  static async createBlock(fieldId: string, ownerId: string, data: CreateScheduleBlockDto) {
    // First verify field ownership
    const field = await prisma.fields.findFirst({
      where: {
        field_id: fieldId,
        owner_id: ownerId,
        deleted_at: null,
      },
    });

    if (!field) {
      return { error: 'FIELD_NOT_FOUND' };
    }

    // Validate time range
    if (data.startTime >= data.endTime) {
      return { error: 'INVALID_TIME_RANGE' };
    }

    // Check for booking conflicts
    const bookingConflicts = await this.checkBookingConflicts(fieldId, data.startTime, data.endTime);
    if (bookingConflicts.length > 0) {
      return { 
        error: 'BOOKING_CONFLICTS', 
        conflicts: bookingConflicts.map(b => ({
          bookingId: b.booking_id,
          startTime: b.start_time,
          endTime: b.end_time,
          customerName: `${b.users.first_name} ${b.users.last_name}`,
          customerEmail: b.users.email,
        })),
      };
    }

    // Check for overlapping blocks (optional - merge or reject)
    const blockOverlaps = await this.checkBlockOverlaps(fieldId, data.startTime, data.endTime);
    if (blockOverlaps.length > 0) {
      return { error: 'BLOCK_OVERLAPS', overlaps: blockOverlaps };
    }

    // Create the block
    const block = await prisma.schedule_blocks.create({
      data: {
        field_id: fieldId,
        start_time: data.startTime,
        end_time: data.endTime,
        reason: data.reason,
        note: data.note,
      },
      include: {
        fields: {
          select: { field_id: true, name: true },
        },
      },
    });

    return { success: true, block };
  }

  /**
   * Delete a schedule block (only if the field is owned by the manager)
   */
  static async deleteBlock(blockId: string, ownerId: string) {
    // Verify ownership through field relation
    const block = await prisma.schedule_blocks.findFirst({
      where: {
        block_id: blockId,
        fields: {
          owner_id: ownerId,
          deleted_at: null,
        },
      },
    });

    if (!block) {
      return null;
    }

    return prisma.schedule_blocks.delete({
      where: { block_id: blockId },
    });
  }

  /**
   * Get schedule blocks that affect availability for a field (for player view)
   * This is used to exclude blocked times from available slots
   */
  static async getBlocksForAvailability(fieldId: string, startDate: Date, endDate: Date) {
    return prisma.schedule_blocks.findMany({
      where: {
        field_id: fieldId,
        // Blocks that overlap with the requested date range
        start_time: { lt: endDate },
        end_time: { gt: startDate },
      },
      select: {
        block_id: true,
        start_time: true,
        end_time: true,
        reason: true,
      },
      orderBy: { start_time: 'asc' },
    });
  }

  /**
   * Check if a specific time slot is blocked
   */
  static async isTimeSlotBlocked(fieldId: string, startTime: Date, endTime: Date): Promise<boolean> {
    const block = await prisma.schedule_blocks.findFirst({
      where: {
        field_id: fieldId,
        // Check for any overlap
        start_time: { lt: endTime },
        end_time: { gt: startTime },
      },
    });

    return !!block;
  }
}
