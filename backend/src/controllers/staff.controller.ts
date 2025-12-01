import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { StaffService } from '../services/staff.service';
import { staff_role } from '@prisma/client';

export class StaffController {
  /**
   * GET /api/manager/staff
   * List all staff members for the authenticated manager
   */
  static async getStaff(req: AuthRequest, res: Response) {
    try {
      const managerId = req.user.id;

      const staff = await StaffService.getStaffByManager(managerId);

      const response = staff.map((s) => ({
        id: s.staff_id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        role: s.role,
        permissions: s.permissions,
        isActive: s.is_active,
        createdAt: s.created_at,
      }));

      res.json(response);
    } catch (error) {
      console.error('Error fetching staff:', error);
      res.status(500).json({ message: 'Error al obtener el personal' });
    }
  }

  /**
   * GET /api/manager/staff/:id
   * Get a specific staff member
   */
  static async getStaffMember(req: AuthRequest, res: Response) {
    try {
      const managerId = req.user.id;
      const staffId = req.params.id;

      const staff = await StaffService.getStaffById(staffId, managerId);

      if (!staff) {
        return res.status(404).json({ message: 'Personal no encontrado' });
      }

      res.json({
        id: staff.staff_id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        permissions: staff.permissions,
        isActive: staff.is_active,
        createdAt: staff.created_at,
      });
    } catch (error) {
      console.error('Error fetching staff member:', error);
      res.status(500).json({ message: 'Error al obtener el personal' });
    }
  }

  /**
   * POST /api/manager/staff
   * Create a new staff member
   */
  static async createStaff(req: AuthRequest, res: Response) {
    try {
      const managerId = req.user.id;
      const { name, email, phone, role, permissions } = req.body;

      // Validation
      if (!name || !email) {
        return res.status(400).json({ message: 'Nombre y email son obligatorios' });
      }

      // Validate role
      const validRoles: staff_role[] = ['encargado', 'administrador', 'recepcionista', 'mantenimiento'];
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({ message: 'Rol inválido' });
      }

      const staff = await StaffService.createStaff(managerId, {
        name,
        email,
        phone,
        role: role || 'encargado',
        permissions,
      });

      res.status(201).json({
        message: 'Personal creado exitosamente',
        staff: {
          id: staff.staff_id,
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          role: staff.role,
          permissions: staff.permissions,
          isActive: staff.is_active,
          createdAt: staff.created_at,
        },
      });
    } catch (error) {
      console.error('Error creating staff:', error);
      res.status(500).json({ message: 'Error al crear el personal' });
    }
  }

  /**
   * PUT /api/manager/staff/:id
   * Update a staff member
   */
  static async updateStaff(req: AuthRequest, res: Response) {
    try {
      const managerId = req.user.id;
      const staffId = req.params.id;
      const { name, email, phone, role, permissions, isActive } = req.body;

      // Validate role if provided
      const validRoles: staff_role[] = ['encargado', 'administrador', 'recepcionista', 'mantenimiento'];
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({ message: 'Rol inválido' });
      }

      const staff = await StaffService.updateStaff(staffId, managerId, {
        name,
        email,
        phone,
        role,
        permissions,
        isActive,
      });

      if (!staff) {
        return res.status(404).json({ message: 'Personal no encontrado' });
      }

      res.json({
        message: 'Personal actualizado exitosamente',
        staff: {
          id: staff.staff_id,
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          role: staff.role,
          permissions: staff.permissions,
          isActive: staff.is_active,
        },
      });
    } catch (error) {
      console.error('Error updating staff:', error);
      res.status(500).json({ message: 'Error al actualizar el personal' });
    }
  }

  /**
   * DELETE /api/manager/staff/:id
   * Soft delete a staff member
   */
  static async deleteStaff(req: AuthRequest, res: Response) {
    try {
      const managerId = req.user.id;
      const staffId = req.params.id;

      const staff = await StaffService.deleteStaff(staffId, managerId);

      if (!staff) {
        return res.status(404).json({ message: 'Personal no encontrado' });
      }

      res.json({ message: 'Personal eliminado exitosamente' });
    } catch (error) {
      console.error('Error deleting staff:', error);
      res.status(500).json({ message: 'Error al eliminar el personal' });
    }
  }

  /**
   * PATCH /api/manager/staff/:id/toggle-active
   * Toggle staff active status
   */
  static async toggleActive(req: AuthRequest, res: Response) {
    try {
      const managerId = req.user.id;
      const staffId = req.params.id;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive debe ser un booleano' });
      }

      const staff = await StaffService.toggleActive(staffId, managerId, isActive);

      if (!staff) {
        return res.status(404).json({ message: 'Personal no encontrado' });
      }

      res.json({
        message: isActive ? 'Personal activado' : 'Personal desactivado',
        staff: {
          id: staff.staff_id,
          isActive: staff.is_active,
        },
      });
    } catch (error) {
      console.error('Error toggling staff active:', error);
      res.status(500).json({ message: 'Error al cambiar el estado del personal' });
    }
  }
}
