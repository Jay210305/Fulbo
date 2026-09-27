import { PartialType } from '@nestjs/swagger';
import { CreateFieldDto } from './create-field.dto.js';

export class UpdateFieldDto extends PartialType(CreateFieldDto) {}
