import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '../common/enums/role.enum.js';
import { serializeUser } from '../common/utils/serialize-user.js';
import { TwilioService } from './twilio.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { SocialAuthDto } from './dto/social-auth.dto.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly twilio: TwilioService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const token = await this.generateToken(user);
    return { token, user: serializeUser(user) };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        city: dto.city,
        district: dto.district,
        role: Role.player,
      },
    });
    const token = await this.generateToken(user);
    return { token, user: serializeUser(user) };
  }

  async social(dto: SocialAuthDto) {
    let user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          avatar: dto.photoUrl,
          role: Role.player,
        },
      });
    }
    const token = await this.generateToken(user);
    return { token, user: serializeUser(user) };
  }

  async sendOtp(userId: string, dto: SendOtpDto) {
    const status = await this.twilio.sendOtp(dto.phone, dto.countryCode);
    return { success: true, message: 'OTP sent', expiresIn: 300, status };
  }

  async verifyOtp(userId: string, dto: VerifyOtpDto) {
    const verified = await this.twilio.verifyOtp(dto.phone, dto.countryCode, dto.code);
    if (!verified) {
      throw new UnauthorizedException('Invalid or expired code');
    }
    const fullPhone = `${dto.countryCode}${dto.phone}`;
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { phoneNumber: fullPhone, phoneVerified: true },
    });
    return { success: true, verified: true, user: serializeUser(user) };
  }

  private async generateToken(user: {
    id: string;
    email: string;
    role: string;
  }): Promise<string> {
    return this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
