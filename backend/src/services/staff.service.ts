import { prisma } from '../config/prisma';
import { staff_role } from '@prisma/client';

// --- DTOs ---
interface CreateStaffDto {
  name: string;
  email: string;
  phone?: string;
  role: staff_role;
  permissions?: Record<string, boolean>;
}

interface UpdateStaffDto {
  name?: string;
  email?: string;
  phone?: string;
  role?: staff_role;
  permissions?: Record<string, boolean>;
  isActive?: boolean;
}

export class StaffService {
  /**
   * Get all staff members for a manager
   */
  static async getStaffByManager(managerId: string) {
    return prisma.staff_members.findMany({
      where: {
        manager_id: managerId,
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get a specific staff member
   */
  static async getStaffById(staffId: string, managerId: string) {
    return prisma.staff_members.findFirst({
      where: {
        staff_id: staffId,
        manager_id: managerId,
        deleted_at: null,
      },
    });
  }

  /**
   * Create a new staff member
   */
  static async createStaff(managerId: string, data: CreateStaffDto) {
    return prisma.staff_members.create({
      data: {
        manager_id: managerId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        permissions: data.permissions || {},
      },
    });
  }

  /**
   * Update a staff member
   */
  static async updateStaff(staffId: string, managerId: string, data: UpdateStaffDto) {
    // Verify ownership
    const staff = await prisma.staff_members.findFirst({
      where: {
        staff_id: staffId,
        manager_id: managerId,
        deleted_at: null,
      },
    });

    if (!staff) {
      return null;
    }

    return prisma.staff_members.update({
      where: { staff_id: staffId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        permissions: data.permissions,
        is_active: data.isActive,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Soft delete a staff member
   */
  static async deleteStaff(staffId: string, managerId: string) {
    // Verify ownership
    const staff = await prisma.staff_members.findFirst({
      where: {
        staff_id: staffId,
        manager_id: managerId,
        deleted_at: null,
      },
    });

    if (!staff) {
      return null;
    }

    return prisma.staff_members.update({
      where: { staff_id: staffId },
      data: {
        deleted_at: new Date(),
        is_active: false,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Toggle staff active status
   */
  static async toggleActive(staffId: string, managerId: string, isActive: boolean) {
    // Verify ownership
    const staff = await prisma.staff_members.findFirst({
      where: {
        staff_id: staffId,
        manager_id: managerId,
        deleted_at: null,
      },
    });

    if (!staff) {
      return null;
    }

    return prisma.staff_members.update({
      where: { staff_id: staffId },
      data: {
        is_active: isActive,
        updated_at: new Date(),
      },
    });
  }
}
