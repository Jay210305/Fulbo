import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { ScheduleService } from './schedule.service.js';
import { CreateScheduleBlockDto } from './dto/create-schedule-block.dto.js';

@ApiTags('manager')
@ApiBearerAuth()
@Roles(Role.manager)
@Controller('manager')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('schedule/blocks')
  @ApiOperation({ summary: "List schedule blocks across the manager's fields" })
  listBlocks(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.scheduleService.listBlocks(userId, { startDate, endDate });
  }

  @Get('fields/:fieldId/schedule/blocks')
  @ApiOperation({ summary: "List schedule blocks for one of the manager's fields" })
  listFieldBlocks(
    @CurrentUser('id') userId: string,
    @Param('fieldId') fieldId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.scheduleService.listFieldBlocks(userId, fieldId, { startDate, endDate });
  }

  @Get('schedule/blocks/:id')
  @ApiOperation({ summary: 'Get one schedule block' })
  getBlock(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) blockId: string) {
    return this.scheduleService.getBlock(userId, blockId);
  }

  @Post('schedule/block')
  @ApiOperation({ summary: 'Create a schedule block (409 with conflicts on booking overlap)' })
  createBlock(@CurrentUser('id') userId: string, @Body() dto: CreateScheduleBlockDto) {
    return this.scheduleService.createBlock(userId, dto);
  }

  @Delete('schedule/block/:id')
  @ApiOperation({ summary: 'Delete one schedule block' })
  deleteBlock(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) blockId: string) {
    return this.scheduleService.deleteBlock(userId, blockId);
  }
}
