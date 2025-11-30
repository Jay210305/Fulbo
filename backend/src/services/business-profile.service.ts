import { prisma } from '../config/prisma';

// --- DTOs ---
export interface CreateBusinessProfileDto {
  businessName: string;
  ruc: string;
  address?: string;
  phone?: string;
  email?: string;
  settings?: Record<string, any>;
}

export interface UpdateBusinessProfileDto {
  businessName?: string;
  ruc?: string;
  address?: string;
  phone?: string;
  email?: string;
  settings?: Record<string, any>;
}

export class BusinessProfileService {
  /**
   * Get business profile by user ID
   */
  static async getByUserId(userId: string) {
    return prisma.business_profiles.findUnique({
      where: { user_id: userId },
    });
  }

  /**
   * Create a new business profile
   */
  static async create(userId: string, data: CreateBusinessProfileDto) {
    return prisma.business_profiles.create({
      data: {
        user_id: userId,
        business_name: data.businessName,
        ruc: data.ruc,
        address: data.address,
        phone: data.phone,
        email: data.email,
        settings: data.settings ?? {},
      },
    });
  }

  /**
   * Update business profile with settings merge
   * If only partial settings are provided, they are merged with existing settings
   */
  static async update(userId: string, data: UpdateBusinessProfileDto) {
    const existingProfile = await prisma.business_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!existingProfile) {
      return null;
    }

    // Merge settings: existing settings + new settings (new overrides existing keys)
    let mergedSettings = existingProfile.settings ?? {};
    if (data.settings) {
      mergedSettings = {
        ...(typeof mergedSettings === 'object' ? mergedSettings : {}),
        ...data.settings,
      };
    }

    return prisma.business_profiles.update({
      where: { user_id: userId },
      data: {
        ...(data.businessName && { business_name: data.businessName }),
        ...(data.ruc && { ruc: data.ruc }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        settings: mergedSettings,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Create or update business profile (upsert)
   */
  static async upsert(userId: string, data: CreateBusinessProfileDto | UpdateBusinessProfileDto) {
    const existingProfile = await this.getByUserId(userId);

    if (existingProfile) {
      return this.update(userId, data as UpdateBusinessProfileDto);
    } else {
      // For create, businessName and ruc are required
      if (!data.businessName || !data.ruc) {
        throw new Error('businessName and ruc are required to create a business profile');
      }
      return this.create(userId, data as CreateBusinessProfileDto);
    }
  }

  /**
   * Check if RUC is already registered by another user
   */
  static async isRucTaken(ruc: string, excludeUserId?: string) {
    const existing = await prisma.business_profiles.findUnique({
      where: { ruc },
    });

    if (!existing) return false;
    if (excludeUserId && existing.user_id === excludeUserId) return false;
    return true;
  }
}
