import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':fieldId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update a review for a field (requires a completed booking)' })
  createReview(
    @CurrentUser('id') userId: string,
    @Param('fieldId') fieldId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(userId, fieldId, dto);
  }

  @Get(':fieldId/can-review')
  @ApiOperation({ summary: 'Check if the current user can review a field' })
  canReview(
    @CurrentUser('id') userId: string,
    @Param('fieldId') fieldId: string,
  ) {
    return this.reviewsService.canReview(userId, fieldId);
  }

  @Get(':fieldId')
  @Public()
  @ApiOperation({ summary: 'List all reviews for a field' })
  listReviews(@Param('fieldId') fieldId: string) {
    return this.reviewsService.listReviews(fieldId);
  }
}
