import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ScheduleBlockReason } from '../../generated/prisma/enums.js';

export class CreateScheduleBlockDto {
  @ApiProperty({ example: 'uuid-of-the-field' })
  @IsString()
  @IsNotEmpty()
  fieldId: string;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-10-01T13:00:00.000Z' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ enum: ScheduleBlockReason })
  @IsIn(['maintenance', 'personal', 'event'])
  reason: ScheduleBlockReason;

  @ApiProperty({ example: 'Cambio de césped', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
