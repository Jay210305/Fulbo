import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReviewsService } from '../src/reviews/reviews.service.js';

const reviewRow = {
  id: 'r1',
  fieldId: 'f1',
  playerId: 'u1',
  rating: 5,
  comment: 'Excelente cancha',
  tags: ['Buen Césped', 'Puntualidad'],
  createdAt: new Date('2026-09-01T00:00:00Z'),
  updatedAt: new Date('2026-09-01T00:00:00Z'),
  player: { firstName: 'Diego', lastName: 'Torres' },
};

function makePrismaMock() {
  return {
    field: { findUnique: vi.fn() },
    booking: { findFirst: vi.fn() },
    review: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  };
}

describe('ReviewsService', () => {
  let prisma: ReturnType<typeof makePrismaMock>;
  let service: ReviewsService;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new ReviewsService(prisma as never);
  });

  describe('createReview', () => {
    it('throws Forbidden without a completed booking at the field', async () => {
      prisma.field.findUnique.mockResolvedValue({ id: 'f1' });
      prisma.booking.findFirst.mockResolvedValue(null);

      await expect(
        service.createReview('u1', 'f1', { rating: 5, comment: 'X' }),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.review.upsert).not.toHaveBeenCalled();
    });

    it('throws NotFound for a missing field', async () => {
      prisma.field.findUnique.mockResolvedValue(null);
      await expect(
        service.createReview('u1', 'missing', { rating: 5 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('upserts one review per player and returns the snake_case review', async () => {
      prisma.field.findUnique.mockResolvedValue({ id: 'f1' });
      prisma.booking.findFirst.mockResolvedValue({ id: 'b1' });
      prisma.review.upsert.mockResolvedValue(reviewRow);

      const result = await service.createReview('u1', 'f1', {
        rating: 4,
        comment: 'Muy buena',
        tags: ['Buen Césped'],
      });

      expect(prisma.review.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { fieldId_playerId: { fieldId: 'f1', playerId: 'u1' } },
          create: expect.objectContaining({ fieldId: 'f1', playerId: 'u1', rating: 4 }),
          update: expect.objectContaining({ rating: 4 }),
        }),
      );
      expect(result.message).toBeTruthy();
      expect(result.review).toMatchObject({
        review_id: 'r1',
        field_id: 'f1',
        player_id: 'u1',
        rating: 5,
        tags: ['Buen Césped', 'Puntualidad'],
        users: { first_name: 'Diego', last_name: 'Torres' },
      });
    });
  });

  describe('listReviews', () => {
    it('returns reviews, average, total and top-5 popular tags', async () => {
      prisma.field.findUnique.mockResolvedValue({ id: 'f1' });
      prisma.review.findMany.mockResolvedValue([
        reviewRow,
        { ...reviewRow, id: 'r2', rating: 3, tags: ['Buen Césped', 'Zona Segura'] },
        { ...reviewRow, id: 'r3', rating: 4, tags: ['Buen Césped'] },
      ]);

      const result = await service.listReviews('f1');

      expect(result.totalCount).toBe(3);
      expect(result.averageRating).toBe(4);
      expect(result.popularTags).toEqual([
        'Buen Césped',
        'Puntualidad',
        'Zona Segura',
      ]);
      expect(result.reviews).toHaveLength(3);
    });

    it('throws NotFound for a missing field', async () => {
      prisma.field.findUnique.mockResolvedValue(null);
      await expect(service.listReviews('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('canReview', () => {
    it('returns true for a player with a completed booking and no review', async () => {
      prisma.field.findUnique.mockResolvedValue({ id: 'f1' });
      prisma.booking.findFirst.mockResolvedValue({ id: 'b1' });
      prisma.review.findUnique.mockResolvedValue(null);

      const result = await service.canReview('u1', 'f1');

      expect(result).toEqual({
        canReview: true,
        hasExistingReview: false,
        existingReview: null,
      });
    });

    it('requires a booking that is confirmed AND already ended', async () => {
      prisma.field.findUnique.mockResolvedValue({ id: 'f1' });
      prisma.booking.findFirst.mockResolvedValue(null);
      prisma.review.findUnique.mockResolvedValue(null);

      const result = await service.canReview('u1', 'f1');
      expect(result.canReview).toBe(false);
      expect(prisma.booking.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'confirmed',
            endTime: { lte: expect.any(Date) },
          }),
        }),
      );
    });

    it('returns false with the existing review when one exists', async () => {
      prisma.field.findUnique.mockResolvedValue({ id: 'f1' });
      prisma.booking.findFirst.mockResolvedValue({ id: 'b1' });
      prisma.review.findUnique.mockResolvedValue(reviewRow);

      const result = await service.canReview('u1', 'f1');

      expect(result.canReview).toBe(false);
      expect(result.hasExistingReview).toBe(true);
      expect(result.existingReview).toMatchObject({ review_id: 'r1' });
    });
  });
});
