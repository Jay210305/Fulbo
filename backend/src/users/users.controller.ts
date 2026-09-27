import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UsersService } from './users.service.js';
import { UpdatePhoneDto } from './dto/update-phone.dto.js';
import { PromoteToManagerDto } from './dto/promote-to-manager.dto.js';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('phone')
  @ApiOperation({ summary: 'Update own phone (requires re-verification)' })
  updatePhone(@CurrentUser('id') userId: string, @Body() dto: UpdatePhoneDto) {
    return this.usersService.updatePhone(userId, dto);
  }

  @Post('promote-to-manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Promote to manager (requires a verified phone)' })
  promoteToManager(@CurrentUser('id') userId: string, @Body() dto: PromoteToManagerDto) {
    return this.usersService.promoteToManager(userId, dto);
  }
}
