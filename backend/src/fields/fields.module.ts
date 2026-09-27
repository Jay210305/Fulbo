import { Module } from '@nestjs/common';
import { FieldsController } from './fields.controller.js';
import { ManagerFieldsController } from './manager-fields.controller.js';
import { FieldsService } from './fields.service.js';

@Module({
  controllers: [FieldsController, ManagerFieldsController],
  providers: [FieldsService],
})
export class FieldsModule {}
