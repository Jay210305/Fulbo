import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../src/users/users.service.js';

const userRecord = {
  id: 'u1',
  email: 'diego@example.com',
  password: null,
  firstName: 'Diego',
  lastName: 'Torres',
  phoneNumber: '+51987654321',
  phoneVerified: true,
  role: 'player',
  avatar: null,
  documentType: null,
  documentNumber: null,
  city: null,
  district: null,
  position: null,
  bio: null,
  gameLevel: 1,
  createdAt: new Date('2026-09-01T00:00:00Z'),
  updatedAt: new Date('2026-09-01T00:00:00Z'),
};

function makePrismaMock() {
  const mock = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    businessProfile: {
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  mock.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) =>
    cb(mock),
  );
  return mock;
}

describe('UsersService', () => {
  let prisma: ReturnType<typeof makePrismaMock>;
  let service: UsersService;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new UsersService(prisma as never);
  });

  describe('getProfile', () => {
    it('returns the own profile in the snake_case contract shape', async () => {
      prisma.user.findUnique.mockResolvedValue(userRecord);

      const profile = await service.getProfile('u1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'u1' } });
      expect(profile).toEqual({
        first_name: 'Diego',
        last_name: 'Torres',
        email: 'diego@example.com',
        phone_number: '+51987654321',
        role: 'player',
      });
    });

    it('throws NotFound when the user no longer exists', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePhone', () => {
    it('persists the new phone and resets phoneVerified to false', async () => {
      prisma.user.update.mockResolvedValue({
        ...userRecord,
        phoneNumber: '+51999888777',
        phoneVerified: false,
      });

      const result = await service.updatePhone('u1', { phone: '+51999888777' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { phoneNumber: '+51999888777', phoneVerified: false },
      });
      expect(result.success).toBe(true);
      expect(result.user.phone_number).toBe('+51999888777');
    });
  });

  describe('promoteToManager', () => {
    it('rejects with 403 when the phone is not verified', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...userRecord, phoneVerified: false });

      await expect(
        service.promoteToManager('u1', { businessName: 'Canchas Lima', ruc: '12345678901' }),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.businessProfile.upsert).not.toHaveBeenCalled();
    });

    it('bumps the role to manager and upserts the business profile', async () => {
      prisma.user.findUnique.mockResolvedValue(userRecord);
      prisma.user.update.mockResolvedValue({ ...userRecord, role: 'manager' });

      const result = await service.promoteToManager('u1', {
        businessName: 'Canchas Lima',
        ruc: '12345678901',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { role: 'manager' },
      });
      expect(prisma.businessProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1' },
          create: expect.objectContaining({ userId: 'u1', businessName: 'Canchas Lima', ruc: '12345678901' }),
        }),
      );
      expect(result.success).toBe(true);
      expect(result.user.role).toBe('manager');
    });
  });
});
