import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking (phone must be verified; price computed server-side)' })
  createBooking(@CurrentUser('id') userId: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(userId, dto);
  }

  @Get('user')
  @ApiOperation({ summary: 'List the authenticated player bookings' })
  getUserBookings(@CurrentUser('id') userId: string) {
    return this.bookingsService.getUserBookings(userId);
  }

  @Get('field/:fieldId')
  @Roles(Role.manager)
  @ApiOperation({ summary: "List bookings of a field (manager, own field only)" })
  getFieldBookings(
    @CurrentUser('id') userId: string,
    @Param('fieldId') fieldId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.bookingsService.getFieldBookings(userId, fieldId, { from, to });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one booking (owner or field owner)' })
  getBookingById(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) bookingId: string) {
    return this.bookingsService.getBookingById(userId, bookingId);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a booking (owner or field owner)' })
  cancelBooking(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) bookingId: string) {
    return this.bookingsService.cancelBooking(userId, bookingId);
  }
}
