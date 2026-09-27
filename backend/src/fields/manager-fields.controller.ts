import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { FieldsService } from './fields.service.js';
import { CreateFieldDto } from './dto/create-field.dto.js';
import { UpdateFieldDto } from './dto/update-field.dto.js';

@ApiTags('manager')
@ApiBearerAuth()
@Roles(Role.manager)
@Controller('manager/fields')
export class ManagerFieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @Get()
  @ApiOperation({ summary: "List the authenticated manager's fields" })
  listFields(@CurrentUser('id') userId: string) {
    return this.fieldsService.listManagerFields(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a field' })
  createField(@CurrentUser('id') userId: string, @Body() dto: CreateFieldDto) {
    return this.fieldsService.createManagerField(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of the manager fields' })
  getField(@CurrentUser('id') userId: string, @Param('id') fieldId: string) {
    return this.fieldsService.getManagerField(userId, fieldId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update one of the manager fields' })
  updateField(
    @CurrentUser('id') userId: string,
    @Param('id') fieldId: string,
    @Body() dto: UpdateFieldDto,
  ) {
    return this.fieldsService.updateManagerField(userId, fieldId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete one of the manager fields' })
  deleteField(@CurrentUser('id') userId: string, @Param('id') fieldId: string) {
    return this.fieldsService.deleteManagerField(userId, fieldId);
  }
}
