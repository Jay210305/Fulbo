import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

interface ReviewRow {
  id: string;
  fieldId: string;
  playerId: string;
  rating: number;
  comment: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  player?: { firstName: string; lastName: string } | null;
}

export function serializeReview(row: ReviewRow) {
  return {
    review_id: row.id,
    field_id: row.fieldId,
    player_id: row.playerId,
    rating: row.rating,
    comment: row.comment,
    tags: row.tags,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    users: row.player
      ? { first_name: row.player.firstName, last_name: row.player.lastName }
      : null,
  };
}

export interface CreateReviewInput {
  rating: number;
  comment?: string;
  tags?: string[];
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getFieldOrThrow(fieldId: string) {
    const field = await this.prisma.field.findUnique({
      where: { id: fieldId },
      select: { id: true },
    });
    if (!field) throw new NotFoundException('Field not found');
    return field;
  }

  private completedBookingFilter(userId: string, fieldId: string) {
    return {
      playerId: userId,
      fieldId,
      status: 'confirmed' as const,
      endTime: { lte: new Date() },
    };
  }

  async createReview(userId: string, fieldId: string, data: CreateReviewInput) {
    const field = await this.getFieldOrThrow(fieldId);
    const completed = await this.prisma.booking.findFirst({
      where: this.completedBookingFilter(userId, field.id),
      select: { id: true },
    });
    if (!completed) {
      throw new ForbiddenException('You need a completed booking to review this field');
    }
    const review = await this.prisma.review.upsert({
      where: { fieldId_playerId: { fieldId: field.id, playerId: userId } },
      create: {
        fieldId: field.id,
        playerId: userId,
        rating: data.rating,
        comment: data.comment,
        tags: data.tags ?? [],
      },
      update: {
        rating: data.rating,
        comment: data.comment,
        tags: data.tags ?? [],
      },
      include: { player: { select: { firstName: true, lastName: true } } },
    });
    return { message: 'Review saved', review: serializeReview(review) };
  }

  async listReviews(fieldId: string) {
    const field = await this.getFieldOrThrow(fieldId);
    const reviews = await this.prisma.review.findMany({
      where: { fieldId: field.id },
      include: { player: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const totalCount = reviews.length;
    const averageRating = totalCount
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount
      : 0;
    const counts = new Map<string, number>();
    for (const review of reviews) {
      for (const tag of review.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    const popularTags = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5)
      .map(([tag]) => tag);
    return {
      reviews: reviews.map(serializeReview),
      averageRating,
      totalCount,
      popularTags,
    };
  }

  async canReview(userId: string, fieldId: string) {
    const field = await this.getFieldOrThrow(fieldId);
    const existing = await this.prisma.review.findUnique({
      where: { fieldId_playerId: { fieldId: field.id, playerId: userId } },
      include: { player: { select: { firstName: true, lastName: true } } },
    });
    if (existing) {
      return {
        canReview: false,
        hasExistingReview: true,
        existingReview: serializeReview(existing),
      };
    }
    const completed = await this.prisma.booking.findFirst({
      where: this.completedBookingFilter(userId, field.id),
      select: { id: true },
    });
    return {
      canReview: Boolean(completed),
      hasExistingReview: false,
      existingReview: null,
    };
  }
}
