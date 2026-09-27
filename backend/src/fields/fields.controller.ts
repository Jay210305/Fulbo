import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator.js';
import { FieldsService } from './fields.service.js';

@ApiTags('fields')
@Controller('fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all fields (lat/lng accepted but ignored until coordinates exist)' })
  listFields() {
    return this.fieldsService.listFields();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get field detail with photos, rating and reviews' })
  getFieldDetail(@Param('id') fieldId: string) {
    return this.fieldsService.getFieldDetail(fieldId);
  }

  @Public()
  @Get(':id/availability')
  @ApiOperation({ summary: 'Get unavailable slots for a field in a date range' })
  getAvailability(
    @Param('id') fieldId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.fieldsService.getAvailability(fieldId, startDate, endDate);
  }
}
