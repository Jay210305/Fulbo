import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { ManagerService } from './manager.service.js';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto.js';
import { UpdatePaymentSettingsDto } from './dto/update-payment-settings.dto.js';
import { ManagerBookingsQueryDto } from './dto/manager-bookings-query.dto.js';

@ApiTags('manager')
@ApiBearerAuth()
@Roles(Role.manager)
@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Manager dashboard stats (period: today|week|month|all)' })
  getStats(@CurrentUser('id') userId: string, @Query('period') period?: string) {
    return this.managerService.getStats(userId, period);
  }

  @Get('stats/chart')
  @ApiOperation({ summary: 'Revenue per day for the last N days (default 7)' })
  getChart(
    @CurrentUser('id') userId: string,
    @Query('days') days?: string,
  ) {
    return this.managerService.getChart(userId, days === undefined ? undefined : Number(days));
  }

  @Get('bookings')
  @ApiOperation({ summary: 'List bookings across the manager own fields (with filters)' })
  listBookings(
    @CurrentUser('id') userId: string,
    @Query() query: ManagerBookingsQueryDto,
  ) {
    return this.managerService.listBookings(userId, query);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get the manager business profile' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.managerService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Upsert the manager business profile' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateBusinessProfileDto,
  ) {
    return this.managerService.updateProfile(userId, dto);
  }

  @Get('payment-settings')
  @ApiOperation({ summary: 'Get the manager payment settings (or defaults)' })
  getPaymentSettings(@CurrentUser('id') userId: string) {
    return this.managerService.getPaymentSettings(userId);
  }

  @Put('payment-settings')
  @ApiOperation({ summary: 'Upsert the manager payment settings' })
  updatePaymentSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePaymentSettingsDto,
  ) {
    return this.managerService.updatePaymentSettings(userId, dto);
  }
}
