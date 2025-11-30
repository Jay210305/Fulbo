import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ScheduleBlockService } from '../services/schedule-block.service';
import { schedule_block_reason } from '@prisma/client';

export class ScheduleBlockController {
  /**
   * GET /api/manager/schedule/blocks
   * Get all schedule blocks for all fields owned by the manager
   */
  static async getAllBlocks(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const { startDate, endDate } = req.query;

      const filters: { startDate?: Date; endDate?: Date } = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const blocks = await ScheduleBlockService.getAllBlocksByOwner(ownerId, filters);

      const response = blocks.map((block) => ({
        id: block.block_id,
        fieldId: block.field_id,
        fieldName: block.fields.name,
        startTime: block.start_time,
        endTime: block.end_time,
        reason: block.reason,
        note: block.note,
        createdAt: block.created_at,
      }));

      res.json(response);
    } catch (error) {
      console.error('Error fetching schedule blocks:', error);
      res.status(500).json({ message: 'Error al obtener los bloqueos de horario' });
    }
  }

  /**
   * GET /api/manager/fields/:fieldId/schedule/blocks
   * Get all schedule blocks for a specific field
   */
  static async getBlocksByField(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const fieldId = req.params.fieldId;
      const { startDate, endDate } = req.query;

      const filters: { startDate?: Date; endDate?: Date } = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const blocks = await ScheduleBlockService.getBlocksByField(fieldId, ownerId, filters);

      if (blocks === null) {
        return res.status(404).json({ message: 'Cancha no encontrada o no tienes permiso' });
      }

      const response = blocks.map((block) => ({
        id: block.block_id,
        fieldId: block.field_id,
        fieldName: block.fields.name,
        startTime: block.start_time,
        endTime: block.end_time,
        reason: block.reason,
        note: block.note,
        createdAt: block.created_at,
      }));

      res.json(response);
    } catch (error) {
      console.error('Error fetching schedule blocks for field:', error);
      res.status(500).json({ message: 'Error al obtener los bloqueos de horario' });
    }
  }

  /**
   * GET /api/manager/schedule/blocks/:id
   * Get a specific schedule block
   */
  static async getBlock(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const blockId = req.params.id;

      const block = await ScheduleBlockService.getBlockById(blockId, ownerId);

      if (!block) {
        return res.status(404).json({ message: 'Bloqueo no encontrado o no tienes permiso' });
      }

      res.json({
        id: block.block_id,
        fieldId: block.field_id,
        fieldName: block.fields.name,
        startTime: block.start_time,
        endTime: block.end_time,
        reason: block.reason,
        note: block.note,
        createdAt: block.created_at,
      });
    } catch (error) {
      console.error('Error fetching schedule block:', error);
      res.status(500).json({ message: 'Error al obtener el bloqueo' });
    }
  }

  /**
   * POST /api/manager/schedule/block
   * Create a new schedule block
   */
  static async createBlock(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const { fieldId, startTime, endTime, reason, note } = req.body;

      // Validation
      if (!fieldId || !startTime || !endTime || !reason) {
        return res.status(400).json({
          message: 'Campo, hora de inicio, hora de fin y razón son obligatorios',
        });
      }

      const validReasons: schedule_block_reason[] = ['maintenance', 'personal', 'event'];
      if (!validReasons.includes(reason)) {
        return res.status(400).json({
          message: 'La razón debe ser "maintenance", "personal" o "event"',
        });
      }

      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Formato de fecha inválido' });
      }

      if (startDate >= endDate) {
        return res.status(400).json({ 
          message: 'La hora de inicio debe ser anterior a la hora de fin' 
        });
      }

      const result = await ScheduleBlockService.createBlock(fieldId, ownerId, {
        startTime: startDate,
        endTime: endDate,
        reason: reason as schedule_block_reason,
        note,
      });

      if ('error' in result) {
        switch (result.error) {
          case 'FIELD_NOT_FOUND':
            return res.status(404).json({ message: 'Cancha no encontrada o no tienes permiso' });
          
          case 'INVALID_TIME_RANGE':
            return res.status(400).json({ 
              message: 'El rango de tiempo es inválido' 
            });
          
          case 'BOOKING_CONFLICTS':
            return res.status(409).json({
              message: 'Existen reservas confirmadas en este rango de tiempo',
              conflicts: result.conflicts,
            });
          
          case 'BLOCK_OVERLAPS':
            return res.status(409).json({
              message: 'Ya existe un bloqueo que se superpone con este rango de tiempo',
            });
          
          default:
            return res.status(400).json({ message: 'Error al crear el bloqueo' });
        }
      }

      res.status(201).json({
        message: 'Bloqueo de horario creado exitosamente',
        block: {
          id: result.block.block_id,
          fieldId: result.block.field_id,
          fieldName: result.block.fields.name,
          startTime: result.block.start_time,
          endTime: result.block.end_time,
          reason: result.block.reason,
          note: result.block.note,
          createdAt: result.block.created_at,
        },
      });
    } catch (error) {
      console.error('Error creating schedule block:', error);
      res.status(500).json({ message: 'Error al crear el bloqueo de horario' });
    }
  }

  /**
   * DELETE /api/manager/schedule/block/:id
   * Delete a schedule block
   */
  static async deleteBlock(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const blockId = req.params.id;

      const block = await ScheduleBlockService.deleteBlock(blockId, ownerId);

      if (!block) {
        return res.status(404).json({ message: 'Bloqueo no encontrado o no tienes permiso' });
      }

      res.json({ message: 'Bloqueo de horario eliminado exitosamente' });
    } catch (error) {
      console.error('Error deleting schedule block:', error);
      res.status(500).json({ message: 'Error al eliminar el bloqueo de horario' });
    }
  }
}
