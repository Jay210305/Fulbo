import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '../common/enums/role.enum.js';
import { serializeUser } from '../common/utils/serialize-user.js';
import { UpdatePhoneDto } from './dto/update-phone.dto.js';
import { PromoteToManagerDto } from './dto/promote-to-manager.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return serializeUser(user);
  }

  async updatePhone(userId: string, dto: UpdatePhoneDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { phoneNumber: dto.phone, phoneVerified: false },
    });
    return { success: true, user: serializeUser(user) };
  }

  async promoteToManager(userId: string, dto: PromoteToManagerDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.phoneVerified) {
      throw new ForbiddenException(
        'Phone verification required before becoming a manager',
      );
    }
    const updated = await this.prisma.$transaction(async (tx) => {
      const promoted = await tx.user.update({
        where: { id: userId },
        data: { role: Role.manager },
      });
      await tx.businessProfile.upsert({
        where: { userId },
        create: {
          userId,
          businessName: dto.businessName,
          ruc: dto.ruc,
        },
        update: { businessName: dto.businessName, ruc: dto.ruc },
      });
      return promoted;
    });
    return { success: true, user: serializeUser(updated) };
  }
}
